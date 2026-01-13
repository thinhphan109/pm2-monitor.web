import { AreaChart } from "@mantine/charts";
import { IconCpu, IconDatabase } from "@tabler/icons-react";

import { formatBytes } from "@/utils/format";
import { trpc } from "@/utils/trpc";

interface ProcessChartProps {
  processId: string;
  refetchInterval: number;
  showMetric: boolean;
}

export default function ProcessChart({ processId, refetchInterval }: ProcessChartProps) {
  const getStats = trpc.process.getStats.useQuery(
    {
      processId,
      range: "seconds",
    },
    {
      refetchInterval,
    },
  );

  const chartData =
    getStats?.data
      ?.map((s) => ({
        CPU: s.cpu,
        RAM: s.memory,
        HEAP_USED: s.heapUsed,
        date: new Date(s.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }),
      }))
      ?.reverse() || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Memory Chart */}
      <div className="glass-card-light p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <IconDatabase size={14} className="text-amber-400" />
          <span className="text-xs text-slate-400 uppercase tracking-wide">Memory Usage</span>
        </div>
        <AreaChart
          h={140}
          data={chartData}
          valueFormatter={(value) => formatBytes(value)}
          dataKey="date"
          type="default"
          series={[
            { name: "RAM", color: "yellow.5", label: "RAM" },
            { name: "HEAP_USED", color: "grape.5", label: "Heap Used" },
          ]}
          withLegend
          withGradient
          withDots={false}
          withXAxis={false}
          yAxisProps={{
            tick: { fill: "#64748b", fontSize: 10 },
            axisLine: { stroke: "#334155" },
            width: 55,
          }}
          gridProps={{ stroke: "#1e293b" }}
          areaChartProps={{ syncId: "process-stats" }}
          curveType="monotone"
          legendProps={{
            verticalAlign: "top",
            height: 30,
          }}
          classNames={{
            legend: "text-xs",
          }}
        />
      </div>

      {/* CPU Chart */}
      <div className="glass-card-light p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <IconCpu size={14} className="text-indigo-400" />
          <span className="text-xs text-slate-400 uppercase tracking-wide">CPU Usage</span>
        </div>
        <AreaChart
          h={140}
          data={chartData}
          dataKey="date"
          type="default"
          valueFormatter={(value) => `${value.toFixed(1)}%`}
          yAxisProps={{
            domain: [0, 100],
            tick: { fill: "#64748b", fontSize: 10 },
            axisLine: { stroke: "#334155" },
            width: 35,
          }}
          series={[{ name: "CPU", color: "indigo.5", label: "CPU %" }]}
          withLegend
          withGradient
          withDots={false}
          withXAxis={false}
          gridProps={{ stroke: "#1e293b" }}
          areaChartProps={{ syncId: "process-stats" }}
          curveType="monotone"
          legendProps={{
            verticalAlign: "top",
            height: 30,
          }}
          classNames={{
            legend: "text-xs",
          }}
        />
      </div>
    </div>
  );
}
