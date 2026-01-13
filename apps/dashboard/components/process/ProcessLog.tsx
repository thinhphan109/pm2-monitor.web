import { ScrollArea } from "@mantine/core";
import { IconTerminal2 } from "@tabler/icons-react";

import { trpc } from "@/utils/trpc";

interface ProcessLogProps {
  processId: string;
  refetchInterval: number;
}

export default function ProcessLog({ processId, refetchInterval }: ProcessLogProps) {
  const getLogs = trpc.process.getLogs.useQuery(
    { processId },
    {
      refetchInterval: refetchInterval,
    },
  );

  const logColors = {
    success: "text-emerald-400",
    error: "text-rose-400",
    warning: "text-amber-400",
    info: "text-blue-400",
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <IconTerminal2 size={14} className="text-slate-500" />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Process Logs
        </span>
      </div>

      {/* Log Container */}
      <div className="bg-[#0c0e14] rounded-lg border border-slate-800">
        <ScrollArea h={120} className="custom-scrollbar" offsetScrollbars>
          <div className="p-3 font-mono text-xs">
            {getLogs?.data?.length ? (
              getLogs.data.map((log) => (
                <div
                  key={log._id}
                  className="flex gap-2 py-0.5 hover:bg-slate-800/30 px-1 -mx-1 rounded"
                >
                  <span className="text-slate-600 shrink-0 tabular-nums">
                    {new Date(log.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <pre
                    className={`
                      flex-1 whitespace-pre-wrap break-all m-0
                      ${logColors[log.type as keyof typeof logColors] || "text-slate-300"}
                    `}
                  >
                    {log.message}
                  </pre>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-600">
                <span className="text-xs">No logs available</span>
              </div>
            )}
            {getLogs.error && (
              <div className="text-rose-400 text-xs">
                Error: {getLogs.error.message}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
