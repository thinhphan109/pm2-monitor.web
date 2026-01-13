import { processModel, serverModel, statModel } from "@pm2.web/mongoose-models";
import { IServer, IUser } from "@pm2.web/typings";
import mongoose from "mongoose";
import { z } from "zod";

import Access from "@/utils/access";
import { PERMISSIONS } from "@/utils/permission";

import { fetchSettings } from "../helpers";
import { protectedProcedure, router } from "../trpc";

export const serverRouter = router({
  getLogs: protectedProcedure
    .input(z.object({ processIds: z.array(z.string()), limit: z.number().optional().default(100) }))
    .query(async ({ ctx, input }) => {
      const { processIds, limit } = input;
      const processLogs = await processModel
        .find(
          { _id: { $in: processIds.map((p) => new mongoose.Types.ObjectId(p)) } },
          {
            _id: 1,
            server: 1,
            logs: 1,
          },
        )
        .lean();

      const filteredLogs = processLogs
        .filter((p) => hasPermission(p._id, p.server, ctx.user, [PERMISSIONS.LOGS]))
        .flatMap((p) => p.logs);

      filteredLogs.sort((a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime());

      return filteredLogs.slice(-limit);
    }),

  getStats: protectedProcedure
    .input(z.object({ processIds: z.array(z.string()), serverIds: z.array(z.string()), polling: z.number() }))
    .query(async ({ input }) => {
      const { processIds, serverIds, polling } = input;

      if (processIds.length === 0 && serverIds.length === 0) {
        return {
          processUptime: 0,
          serverUptime: 0,
          stats: [],
        };
      }

      const processPipeline: Parameters<typeof statModel.aggregate>[0] = [
        {
          $match: {
            "source.process": { $in: processIds.map((p) => new mongoose.Types.ObjectId(p)) },
          },
        },
        {
          $sort: { _id: -1 },
        },
        {
          $limit: Math.max(1, 10 * processIds.length),
        },
        {
          $densify: {
            field: "timestamp",
            range: {
              step: polling,
              unit: "second",
              bounds: "full",
            },
          },
        },
        {
          $group: {
            _id: {
              $dateTrunc: {
                date: "$timestamp",
                unit: "second",
                binSize: polling,
              },
            },
            processRam: { $avg: "$memory" },
            processCpu: { $avg: "$cpu" },
            processUptime: { $avg: "$uptime" },
          },
        },
        {
          $limit: 10,
        },
      ];

      const serverPipeline: Parameters<typeof statModel.aggregate>[0] = [
        {
          $match: {
            "source.server": { $in: serverIds.map((p) => new mongoose.Types.ObjectId(p)) },
            "source.process": undefined,
          },
        },
        {
          $sort: { _id: -1 },
        },
        {
          $limit: Math.max(1, 10 * serverIds.length),
        },
        {
          $densify: {
            field: "timestamp",
            range: {
              step: polling,
              unit: "second",
              bounds: "full",
            },
          },
        },
        {
          $group: {
            _id: {
              $dateTrunc: {
                date: "$timestamp",
                unit: "second",
                binSize: polling,
              },
            },
            serverRam: { $avg: "$memory" },
            serverCpu: { $avg: "$cpu" },
            serverUptime: { $avg: "$uptime" },
          },
        },
        {
          $limit: 20,
        },
      ];

      const processStats = processIds.length > 0 ? await statModel.aggregate(processPipeline) : [];
      const serverStats = serverIds.length > 0 ? await statModel.aggregate(serverPipeline) : [];

      const mergedStats = processStats.map((processStat) => {
        const correspondingServerStat = serverStats.find(
          (serverStat) => serverStat._id?.toString() === processStat._id?.toString(),
        );
        return { ...processStat, ...correspondingServerStat, _id: (processStat._id || correspondingServerStat?._id)?.toString() };
      });

      // If no process stats but we have server stats, show those
      if (mergedStats.length === 0 && serverStats.length > 0) {
        serverStats.forEach(s => {
          mergedStats.push({ ...s, _id: s._id?.toString() });
        });
      }

      return {
        processUptime: mergedStats?.[0]?.processUptime || 0,
        serverUptime: mergedStats?.[0]?.serverUptime || 0,
        stats: mergedStats.reverse(),
      };
    }),

  getDashBoardData: protectedProcedure.input(z.boolean().optional()).query(async ({ input: excludeDaemon }) => {
    const settings = await fetchSettings();

    const serverDocs = await serverModel
      .find(
        {},
        {
          createdAt: 0,
        },
      )
      .lean();

    const processDocs = await processModel
      .find(
        {},
        {
          logs: 0,
          stats: 0,
          createdAt: 0,
          restartCount: 0,
          deleteCount: 0,
          toggleCount: 0,
        },
      )
      .lean();

    // Fetch latest stats for all servers to populate the public dashboard
    // We get the single most recent stat document for each serverId
    const latestStats = await statModel.aggregate([
      {
        $match: {
          "source.server": { $in: serverDocs.map((s) => s._id) },
          "source.process": undefined, // Only server stats
        },
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$source.server",
          cpu: { $first: "$cpu" },
          memory: { $first: "$memory" },
          uptime: { $first: "$uptime" },
          timestamp: { $first: "$timestamp" },
        },
      },
    ]);

    // Create a lookup map for faster access
    const statsMap = new Map(latestStats.map((s) => [s._id.toString(), s]));

    // Convert ObjectIds to strings for Next.js serialization
    const processes = processDocs.map((p) => ({
      ...p,
      _id: p._id.toString(),
      server: p.server.toString(),
      updatedAt: (p.updatedAt as unknown as Date).toISOString(),
    }));

    const servers = serverDocs.map((s) => {
      const sId = s._id.toString();
      const stat = statsMap.get(sId);

      return {
        ...s,
        _id: sId,
        // Attach live stats if available (and recent enough, e.g. < 5 mins?)
        // relying on heartbeat is better, but this gives numbers.
        serverCpu: stat?.cpu || 0,
        serverRam: stat?.memory || 0,
        serverUptime: stat?.uptime || 0,
        processes: processes.filter(
          (p) =>
            p.server === sId &&
            (settings.excludeDaemon || excludeDaemon ? p.name !== "pm2.web-daemon" : true),
        ),
      } as unknown as IServer;
    });

    return { settings, servers };
  }),

  getUptimeHistory: protectedProcedure
    .input(z.object({ serverIds: z.array(z.string()) }))
    .query(async ({ input }) => {
      const { serverIds } = input;
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const history = await statModel.aggregate([
        {
          $match: {
            "source.server": { $in: serverIds.map((id) => new mongoose.Types.ObjectId(id)) },
            "source.process": undefined,
            timestamp: { $gte: twentyFourHoursAgo },
          },
        },
        {
          $group: {
            _id: {
              server: "$source.server",
              hour: { $dateTrunc: { date: "$timestamp", unit: "hour" } },
            },
            avgCpu: { $avg: "$cpu" },
          },
        },
        { $sort: { "_id.hour": 1 } },
      ]);

      return history.map((h) => ({
        serverId: h._id.server.toString(),
        hour: h._id.hour.toISOString(),
        online: true,
      }));
    }),

  getRecentIncidents: protectedProcedure
    .query(async () => {
      const incidents = await processModel.aggregate([
        { $unwind: "$logs" },
        { $match: { "logs.type": "error" } },
        { $sort: { "logs.createdAt": -1 } },
        { $limit: 20 },
        {
          $lookup: {
            from: "servers",
            localField: "server",
            foreignField: "_id",
            as: "serverInfo"
          }
        },
        { $unwind: "$serverInfo" },
        {
          $project: {
            _id: 0,
            processName: "$name",
            serverName: "$serverInfo.name",
            message: "$logs.message",
            createdAt: "$logs.createdAt",
          }
        }
      ]);

      return incidents.map(i => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
      }));
    }),
});

const hasPermission = (processId: string, serverId: string, user: IUser, requiredPerms: number[]) => {
  if (user.acl.admin || user.acl.owner) return true;
  if (user.name === "Showcase Guest") return true; // Allow all READ-ONLY access for guest
  const userPerms = new Access(user?.acl?.servers || []).getPerms(serverId.toString(), processId.toString());
  if (!userPerms.has(...requiredPerms)) {
    return false;
  }

  return true;
};
