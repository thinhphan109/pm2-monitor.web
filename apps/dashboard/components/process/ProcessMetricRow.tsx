import { IProcess } from "@pm2.web/typings";
import { IconClock, IconCpu, IconDatabase, IconRefresh } from "@tabler/icons-react";
import ms from "ms";

import { formatBytes } from "@/utils/format";
import { trpc } from "@/utils/trpc";

import ProcessGitMetric from "./ProcessGitMetric";

interface ProcessMetricRowProps {
  process: IProcess;
  refetchInterval: number;
  showMetric: boolean;
}

export default function ProcessMetricRow({ process, refetchInterval, showMetric }: ProcessMetricRowProps) {
  const getStat = trpc.process.getStat.useQuery(
    { processId: process._id },
    {
      refetchInterval,
    },
  );

  if (!showMetric) {
    return (
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <span>Process not running</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Git Info */}
      {process?.versioning?.url && (
        <ProcessGitMetric versioning={process.versioning} />
      )}

      {/* Memory */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <IconDatabase size={14} className="text-indigo-400" />
        <span className="font-mono text-xs text-slate-200">
          {formatBytes(getStat.data?.memory || 0)}
        </span>
      </div>

      {/* CPU */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <IconCpu size={14} className="text-blue-400" />
        <span className="font-mono text-xs text-slate-200">
          {(getStat.data?.cpu?.toFixed(0) || 0)}%
        </span>
      </div>

      {/* Uptime */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <IconClock size={14} className="text-emerald-400" />
        <span className="font-mono text-xs text-slate-200">
          {ms(getStat.data?.uptime || 0)}
        </span>
      </div>

      {/* Restarts */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <IconRefresh size={14} className="text-amber-400" />
        <span className="font-mono text-xs text-slate-200">
          {process.pm_restarts || 0}
        </span>
      </div>
    </div>
  );
}
