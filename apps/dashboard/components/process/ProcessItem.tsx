import { Tooltip, Transition } from "@mantine/core";
import { IProcess, ISetting } from "@pm2.web/typings";
import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";

import ProcessAction from "./ProcessActionRow";
import ProcessChart from "./ProcessChart";
import ProcessLog from "./ProcessLog";
import ProcessMetricRow from "./ProcessMetricRow";

interface ProcessItemProps {
  process: IProcess;
  setting: ISetting;
}

export default function ProcessItem({ process, setting }: ProcessItemProps) {
  const [collapsed, setCollapsed] = useState(true);

  const getStatusStyles = () => {
    switch (process.status) {
      case "online": {
        return {
          dot: "bg-emerald-400",
          glow: "shadow-emerald-400/30",
          border: "border-emerald-400/20",
          text: "text-emerald-400",
        };
      }
      case "stopped": {
        return {
          dot: "bg-amber-400",
          glow: "shadow-amber-400/30",
          border: "border-amber-400/20",
          text: "text-amber-400",
        };
      }
      default: {
        return {
          dot: "bg-rose-500",
          glow: "shadow-rose-500/30",
          border: "border-rose-500/20",
          text: "text-rose-500",
        };
      }
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <div
      className={`
        glass-card overflow-hidden transition-all duration-300
        hover:border-slate-600/70
        ${collapsed ? "" : "ring-1 ring-indigo-500/20"}
      `}
    >
      {/* Main Header Row */}
      <div className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Status & Name */}
          <div className="flex items-center gap-4">
            {/* Process Info */}
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold text-white tracking-tight leading-none">
                  {process.name}
                </span>

                {/* Compact Status Indicator "Button" */}
                <Tooltip
                  label={process.status === "online" ? "Đang chạy" : process.status === "stopped" ? "Đã dừng" : "Ngoại tuyến"}
                  position="top"
                  withArrow
                >
                  <div className={`
                    px-2.5 py-1 rounded-md bg-slate-800/40 border transition-colors
                    ${statusStyles.border} flex items-center justify-center
                  `}>
                    <div
                      className={`
                        w-2 h-2 rounded-full ${statusStyles.dot}
                        ${process.status === "online" ? "animate-pulse" : ""}
                      `}
                      style={{
                        boxShadow: process.status === "online"
                          ? "0 0 10px rgba(52, 211, 153, 0.6)"
                          : undefined
                      }}
                    />
                  </div>
                </Tooltip>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                {process.type} • PID: {process.pm_id ?? "N/A"}
              </div>
            </div>
          </div>

          {/* Right: Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            {/* Metrics Row */}
            <ProcessMetricRow
              process={process}
              refetchInterval={setting.polling.frontend}
              showMetric={process.status === "online"}
            />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ProcessAction
                processId={process._id}
              />

              {/* Expand/Collapse Toggle */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  text-slate-400 hover:text-slate-200 hover:bg-slate-800/50
                  ${collapsed ? "" : "bg-slate-800/50 text-indigo-400"}
                `}
              >
                <IconChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <Transition transition="slide-down" duration={300} mounted={!collapsed}>
        {(styles) => (
          <div style={styles} className="border-t border-slate-700/50">
            {/* Charts Section */}
            <div className="p-4 bg-slate-900/30">
              <ProcessChart
                processId={process._id}
                refetchInterval={setting.polling.frontend}
                showMetric={process.status === "online"}
              />
            </div>

            {/* Logs Section */}
            <div className="border-t border-slate-700/50">
              <ProcessLog
                processId={process._id}
                refetchInterval={setting.polling.frontend}
              />
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
}
