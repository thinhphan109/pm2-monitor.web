import { AreaChart, DonutChart } from "@mantine/charts";
import { Flex, SimpleGrid } from "@mantine/core";
import { ISetting } from "@pm2.web/typings";
import { IconClock, IconCpu, IconDatabase, IconServer } from "@tabler/icons-react";
import ms from "ms";
import { useSelected } from "@/components/context/SelectedProvider";
import DashboardLog from "@/components/dashboard/DashboardLog";
import { formatBytes } from "@/utils/format";
import { trpc } from "@/utils/trpc";

// Chart configuration with dark theme
const areaChartProps = {
    h: 140,
    withLegend: true,
    withGradient: true,
    withDots: false,
    withXAxis: false,
    yAxisProps: {
        width: 50,
        tick: { fill: "#64748b", fontSize: 10 },
        axisLine: { stroke: "#334155" },
    },
    gridProps: {
        stroke: "#1e293b",
    },
    areaChartProps: { syncId: "stats" },
    connectNulls: true,
    curveType: "monotone" as const,
};

// Custom Tooltip Component
interface TooltipPayload {
    color?: string;
    name?: string;
    value?: number;
}

function ChartTooltip({
    payload,
    label,
    unit,
    formatValue
}: {
    payload?: TooltipPayload[];
    label?: string;
    unit?: string;
    formatValue?: (value: number) => string;
}) {
    if (!payload?.length) return null;

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
            <div className="text-xs text-slate-400 mb-2">{label}</div>
            {payload.map((entry, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-300">{entry.name}:</span>
                    <span className="font-mono text-white">
                        {entry.value === undefined
                            ? 'N/A'
                            : formatValue
                                ? formatValue(entry.value)
                                : `${entry.value.toFixed(1)}${unit || ''}`}
                    </span>
                </div>
            ))}
        </div>
    );
}

// Status Legend Component
function StatusLegend({ label, count, color }: { label: string; count: number; color: string }) {
    const colorClasses = {
        emerald: "bg-emerald-400",
        amber: "bg-amber-400",
        rose: "bg-rose-500",
    };

    return (
        <div className="flex items-center gap-1.5" title={label}>
            <div className={`w-2 h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`} />
            <span className="text-xs text-slate-400">{count}</span>
        </div>
    );
}

interface AdminDashboardProps {
    settings: ISetting;
}

export default function AdminDashboard({ settings }: AdminDashboardProps) {
    const { selectedServers, selectedProcesses } = useSelected();
    const { data } = trpc.server.getStats.useQuery(
        {
            processIds: selectedProcesses.map((p) => p._id),
            serverIds: selectedServers.map((p) => p._id),
            polling: settings.polling.backend / 1000,
        },
        {
            refetchInterval: settings.polling.frontend,
        },
    );

    const chartData = data?.stats?.map((e) => ({
        ...e,
        date: new Date(e._id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })) || [];

    const onlineCount = selectedProcesses.filter((p) => p.status == "online").length;
    const stoppedCount = selectedProcesses.filter((p) => p.status == "stopped").length;
    const offlineCount = selectedProcesses.filter((p) => p.status == "offline").length;
    const totalCount = onlineCount + stoppedCount + offlineCount;

    return (
        <Flex direction="column" gap="md" className="h-full">
            {/* Stats Grid */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                {/* CPU Chart */}
                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <IconCpu size={16} className="text-blue-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wide">CPU Usage</span>
                    </div>
                    <AreaChart
                        {...areaChartProps}
                        data={chartData}
                        dataKey="date"
                        type="default"
                        valueFormatter={(value) => `${value.toFixed(1)}%`}
                        series={[
                            { name: "processCpu", color: "blue.5", label: "Process" },
                            { name: "serverCpu", color: "grape.5", label: "Server" },
                        ]}
                        tooltipProps={{
                            content: ({ payload, label }) => (
                                <ChartTooltip payload={payload} label={label} unit="%" />
                            ),
                        }}
                    />
                </div>

                {/* RAM Chart */}
                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <IconDatabase size={16} className="text-indigo-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Memory Usage</span>
                    </div>
                    <AreaChart
                        {...areaChartProps}
                        data={chartData}
                        dataKey="date"
                        type="default"
                        valueFormatter={(value) => formatBytes(value)}
                        series={[
                            { name: "processRam", color: "indigo.5", label: "Process" },
                            { name: "serverRam", color: "yellow.5", label: "Server" },
                        ]}
                        tooltipProps={{
                            content: ({ payload, label }) => (
                                <ChartTooltip payload={payload} label={label} formatValue={formatBytes} />
                            ),
                        }}
                    />
                </div>

                {/* Uptime Stats */}
                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <IconClock size={16} className="text-violet-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Uptime</span>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-500">Server</span>
                                <span className="text-xs text-emerald-400">Online</span>
                            </div>
                            <div className="font-mono text-xl font-semibold text-white">
                                {ms(data?.serverUptime || 0, { long: true })}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-500">Process</span>
                            </div>
                            <div className="font-mono text-xl font-semibold text-white">
                                {ms(data?.processUptime || 0, { long: true })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Donut */}
                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <IconServer size={16} className="text-emerald-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Status</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <DonutChart
                            size={120}
                            thickness={16}
                            data={[
                                { name: "Online", value: onlineCount || 0, color: "teal.5" },
                                { name: "Stopped", value: stoppedCount || 0, color: "yellow.5" },
                                { name: "Offline", value: offlineCount || 0, color: "red.5" },
                            ]}
                            startAngle={180}
                            endAngle={0}
                            chartLabel={totalCount > 0 ? `${Math.round((onlineCount / totalCount) * 100)}%` : "0%"}
                            style={{ marginBottom: -40 }}
                            classNames={{
                                label: "text-white font-semibold text-lg",
                            }}
                        />
                        <div className="flex gap-4 mt-6">
                            <StatusLegend label="Online" count={onlineCount} color="emerald" />
                            <StatusLegend label="Stopped" count={stoppedCount} color="amber" />
                            <StatusLegend label="Offline" count={offlineCount} color="rose" />
                        </div>
                    </div>
                </div>
            </SimpleGrid>

            {/* Logs Section */}
            <DashboardLog
                refetchInterval={settings.polling.frontend}
                processIds={selectedProcesses.map((p) => p._id)}
            />
        </Flex>
    );
}
