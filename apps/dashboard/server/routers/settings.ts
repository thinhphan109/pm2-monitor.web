import { processModel, serverModel, settingModel, statModel } from "@pm2.web/mongoose-models";
import { z } from "zod";

import { defaultSettings } from "@/utils/constants";

import { fetchSettings } from "../helpers";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../trpc";

export const settingRouter = router({
  deleteAll: adminProcedure.mutation(async () => {
    const servers = await serverModel.deleteMany({});
    const processes = await processModel.deleteMany({});
    const stats = await statModel.deleteMany({});
    return `Deleted ${servers.deletedCount} Servers, ${processes.deletedCount} Processes, ${stats.deletedCount} Stats`;
  }),
  deleteLogs: adminProcedure.mutation(async () => {
    const processes = await processModel.updateMany({}, { $set: { logs: [] } });
    await statModel.deleteMany({});
    return `Deleted logs for ${processes.modifiedCount} processes`;
  }),
  updateSetting: adminProcedure
    .input(
      z.object({
        polling: z.object({
          frontend: z.number(),
          backend: z.number(),
        }),
        logRotation: z.number(),
        registrationCode: z.string().length(6),
        excludeDaemon: z.boolean(),
        showcaseMode: z.boolean(),
        processPin: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const setting = await settingModel.findOne({});
      if (!setting) {
        // create new setting
        const newSetting = new settingModel({ ...defaultSettings, ...input });
        await newSetting.save();
        return "Configuration updated successfully";
      }

      setting.polling = input.polling;
      setting.logRotation = input.logRotation;
      setting.registrationCode = input.registrationCode;
      setting.excludeDaemon = input.excludeDaemon;
      setting.showcaseMode = input.showcaseMode;
      if (input.processPin !== undefined) {
        (setting as any).processPin = input.processPin;
      }

      await setting.save();
      return "Configuration updated successfully";
    }),
  getSettings: protectedProcedure.query(async () => {
    const settings = await fetchSettings();
    return settings;
  }),
  registrationCodeRequired: publicProcedure.query(async () => {
    const settings = await fetchSettings();
    return !!settings?.registrationCode;
  }),
  // Check if processPin is configured (for showing/hiding PIN modal)
  hasProcessPin: publicProcedure.query(async () => {
    const settings = await fetchSettings();
    return !!(settings as any)?.processPin;
  }),
  // Verify PIN for guest access to /process
  verifyProcessPin: publicProcedure
    .input(z.object({ pin: z.string() }))
    .mutation(async ({ input }) => {
      const settings = await fetchSettings();
      const storedPin = (settings as any)?.processPin || "";
      if (!storedPin) {
        // No PIN configured, allow access
        return { success: true, message: "No PIN required" };
      }
      if (input.pin === storedPin) {
        return { success: true, message: "PIN verified" };
      }
      return { success: false, message: "Invalid PIN" };
    }),
});

export type SettingRouter = typeof settingRouter;
