import { settingModel, userModel } from "@pm2.web/mongoose-models";
import { initTRPC, TRPCError } from "@trpc/server";
import mongoose from "mongoose";
import superjson from "superjson";

import { createTRPCContext } from "./context";

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
  transformer: superjson,
});

// Base router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure
 */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next, path }) => {
  const settings = await settingModel.findOne({}).lean();
  // Default to true if not found to support the user's "status-first" requirement
  const isShowcaseMode = settings ? settings.showcaseMode : true;

  // Safe procedures that can be accessed in showcase mode
  const safePaths = [
    "server.getDashBoardData",
    "server.getStats",
    "server.getLogs",
    "server.getUptimeHistory",
    "server.getRecentIncidents",
    "process.getStat",
    "process.getStats",
    "process.getLogs",
  ];

  if (!ctx.session || !ctx.session.user) {
    if (isShowcaseMode && safePaths.includes(path)) {
      // Provide a dummy "Read-Only" user for showcase mode
      return next({
        ctx: {
          session: null,
          user: {
            _id: new mongoose.Types.ObjectId(),
            name: "Showcase Guest",
            email: "guest@showcase.local",
            acl: {
              admin: false,
              owner: false,
              servers: [], // No specific server permissions, logic handles this
            },
          } as any,
        },
      });
    }

    console.log(`[TRPC] Unauthorized access attempt to path: ${path} (Showcase: ${isShowcaseMode})`);
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = await userModel.findById(ctx.session.user.id);
  if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

  return next({
    ctx: {
      user: user,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user?.acl?.admin && !ctx.user?.acl?.owner) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Owner/Admin permission required!" });
  }
  return next({ ctx });
});
export const ownerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user?.acl?.owner) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Owner permission required!" });
  }
  return next({ ctx });
});
