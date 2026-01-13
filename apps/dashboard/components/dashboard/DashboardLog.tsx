import { ActionIcon, ScrollArea, Tooltip } from "@mantine/core";
import { IconArrowDown, IconTerminal2 } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { trpc } from "@/utils/trpc";

interface DashboardLogProps {
  refetchInterval: number;
  processIds: string[];
}

export default function DashboardLog({ refetchInterval, processIds }: DashboardLogProps) {
  const scrollViewport = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(true);

  const { data } = trpc.server.getLogs.useQuery(
    { processIds },
    {
      refetchInterval: refetchInterval,
    },
  );

  const scrollToBottom = () =>
    scrollViewport.current?.scrollTo({ top: scrollViewport.current.scrollHeight, behavior: 'smooth' });

  useEffect(() => {
    if (shouldScroll && data) {
      scrollToBottom();
    }
  }, [data, shouldScroll]);

  const onScrollPositionChange = ({ y }: { x: number; y: number }) => {
    if (scrollViewport.current) {
      const isAtBottom = scrollViewport.current.scrollHeight - scrollViewport.current.clientHeight <= y + 20;
      setShouldScroll(isAtBottom);
    }
  };

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
            ({data.length} dòng)
          </span>
        )}
      </div>

      {/* Terminal-style Log Viewer */}
      <div className="terminal-bg flex-1 overflow-hidden relative group">
        <ScrollArea.Autosize
          viewportRef={scrollViewport}
          mah="70vh"
          className="custom-scrollbar"
          offsetScrollbars
          onScrollPositionChange={onScrollPositionChange}
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
                <span className="text-sm">Không có dữ liệu Log</span>
                <span className="text-xs mt-1">Logs sẽ xuất hiện khi các process có dữ liệu output</span>
              </div>
            )}
          </div>
        </ScrollArea.Autosize>

        {/* Scroll to Bottom Button */}
        {!shouldScroll && (
          <div className="absolute bottom-6 right-8 z-10">
            <Tooltip label="Cuộn xuống cuối" position="left" withArrow>
              <ActionIcon
                variant="filled"
                color="indigo"
                radius="xl"
                size="lg"
                onClick={scrollToBottom}
                className="shadow-xl shadow-indigo-500/30"
              >
                <IconArrowDown size={20} />
              </ActionIcon>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
