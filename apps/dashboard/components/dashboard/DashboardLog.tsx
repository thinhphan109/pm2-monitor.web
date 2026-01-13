import { ScrollArea } from "@mantine/core";
import { IconTerminal2 } from "@tabler/icons-react";
import { useRef } from "react";

import { trpc } from "@/utils/trpc";

interface DashboardLogProps {
  refetchInterval: number;
  processIds: string[];
}

export default function DashboardLog({ refetchInterval, processIds }: DashboardLogProps) {
  const scrollViewport = useRef<HTMLDivElement>(null);
  const { data } = trpc.server.getLogs.useQuery(
    { processIds },
    {
      refetchInterval: refetchInterval,
    },
  );

  const logColors = {
    success: "text-emerald-400",
    error: "text-rose-500",
    warning: "text-amber-400",
    info: "text-blue-400",
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <IconTerminal2 size={18} className="text-slate-400" />
        <span className="text-sm font-medium text-slate-200">Logs</span>
        {data?.length && (
          <span className="text-xs text-slate-500">
            ({data.length} entries)
          </span>
        )}
      </div>

      {/* Terminal-style Log Viewer */}
      <div className="terminal-bg flex-1 overflow-hidden">
        <ScrollArea.Autosize
          viewportRef={scrollViewport}
          mah="50vh"
          className="custom-scrollbar"
          offsetScrollbars
        >
          <div className="p-4 font-mono text-sm">
            {data?.length ? (
              data.map((log) => (
                <div
                  key={log?._id}
                  className="flex gap-3 py-1 hover:bg-slate-800/30 px-2 -mx-2 rounded transition-colors"
                >
                  {/* Timestamp */}
                  <span className="text-slate-500 font-mono text-xs shrink-0 tabular-nums">
                    {new Date(log?.createdAt || 0).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>

                  {/* Log Type Badge */}
                  <span
                    className={`
                      shrink-0 text-xs uppercase font-medium
                      ${logColors[log?.type || "info"]}
                    `}
                  >
                    [{log?.type || "info"}]
                  </span>

                  {/* Message */}
                  <pre
                    className={`
                      flex-1 whitespace-pre-wrap break-all m-0 font-mono text-sm
                      ${log?.type === "error" ? "text-rose-400" : "text-slate-300"}
                    `}
                  >
                    {log?.message}
                  </pre>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <IconTerminal2 size={32} className="mb-2 opacity-50" />
                <span className="text-sm">No logs available</span>
                <span className="text-xs mt-1">Logs will appear here when processes generate output</span>
              </div>
            )}
          </div>
        </ScrollArea.Autosize>
      </div>
    </div>
  );
}
