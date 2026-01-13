import { Badge, Center, Flex, Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCircleCheck, IconCircleX, IconClock, IconCpu, IconDatabase, IconServer, IconStack2 } from "@tabler/icons-react";
import ms from "ms";

interface WorkerGridProps {
    servers: any[];
}

export default function WorkerGrid({ servers }: WorkerGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map((server) => {
                const isOnline = new Date(server.heartbeat).getTime() > Date.now() - 30000;
                const onlineProcesses = server.processes?.filter((p: any) => p.status === "online").length || 0;
                const totalProcesses = server.processes?.length || 0;

                const cpuUsage = server.serverCpu || 0;
                const ramUsageGB = (server.serverRam || 0) / 1024 / 1024 / 1024;

                return (
                    <Paper key={server._id} className="glass-card p-4 relative overflow-hidden group">
                        {/* Status Glow Background */}
                        <div
                            className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${isOnline ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                        />

                        <Stack gap="sm">
                            {/* Header: Name & Status */}
                            <Group justify="space-between" wrap="nowrap">
                                <Group gap="sm">
                                    <ThemeIcon
                                        variant="light"
                                        color={isOnline ? "emerald" : "rose"}
                                        size="lg"
                                        className="bg-slate-800/50"
                                    >
                                        <IconServer size={20} />
                                    </ThemeIcon>
                                    <div>
                                        <Text size="sm" fw={600} className="text-white truncate max-w-[150px]">
                                            {server.name}
                                        </Text>
                                        <Group gap={6}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-rose-500 animate-pulse"}`} />
                                            <Text size="xs" className="text-slate-500 font-mono">
                                                {isOnline ? "ONLINE" : "OFFLINE"}
                                            </Text>
                                        </Group>
                                    </div>
                                </Group>
                            </Group>

                            {/* Compact Metrics Row */}
                            <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-800/50">
                                {/* Uptime (RESTART) */}
                                <div className="flex flex-col items-center">
                                    <Group gap={4} mb={2}>
                                        <IconClock size={12} className="text-slate-500" />
                                        <Text size="xs" className="text-slate-500 uppercase text-[10px]">Uptime</Text>
                                    </Group>
                                    <Text size="sm" fw={600} className="text-white font-mono leading-none">
                                        {ms(server.serverUptime || 0)}
                                    </Text>
                                </div>

                                {/* CPU */}
                                <div className="flex flex-col items-center border-l border-slate-800/50">
                                    <Group gap={4} mb={2}>
                                        <IconCpu size={12} className="text-slate-500" />
                                        <Text size="xs" className="text-slate-500 uppercase text-[10px]">CPU</Text>
                                    </Group>
                                    <Text size="sm" fw={600} className="text-blue-200 font-mono leading-none">
                                        {cpuUsage.toFixed(0)}%
                                    </Text>
                                </div>

                                {/* RAM */}
                                <div className="flex flex-col items-center border-l border-slate-800/50">
                                    <Group gap={4} mb={2}>
                                        <IconDatabase size={12} className="text-slate-500" />
                                        <Text size="xs" className="text-slate-500 uppercase text-[10px]">RAM</Text>
                                    </Group>
                                    <Text size="sm" fw={600} className="text-fuchsia-200 font-mono leading-none">
                                        {ramUsageGB.toFixed(1)}G
                                    </Text>
                                </div>
                            </div>

                            {/* Footer: Last Seen */}
                            <Flex justify="space-between" align="center">
                                <Text size="[10px]" className="text-slate-600">
                                    Heartbeat
                                </Text>
                                <Text size="xs" fw={500} className="text-slate-400" suppressHydrationWarning>
                                    Seen {ms(Math.max(0, Date.now() - new Date(server.heartbeat).getTime()))} ago
                                </Text>
                            </Flex>
                        </Stack>
                    </Paper>
                );
            })}
        </div>
    );
}
