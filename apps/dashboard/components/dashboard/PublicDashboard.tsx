import { Badge, Button, Group, Stack, Text, Title } from "@mantine/core";
import { ISetting } from "@pm2.web/typings";
import { IconAlertTriangle, IconClock, IconLogin } from "@tabler/icons-react";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import RecentIncidents from "./RecentIncidents";
import StatusHistory from "./StatusHistory";
import WorkerGrid from "./WorkerGrid";

interface PublicDashboardProps {
    servers: any[];
    settings: ISetting;
}

export default function PublicDashboard({ servers, settings }: PublicDashboardProps) {
    const serverIds = servers.map(s => s._id);
    const { data: historyData } = trpc.server.getUptimeHistory.useQuery(
        { serverIds },
        { refetchInterval: 60000 }
    );

    const { data: incidentData } = trpc.server.getRecentIncidents.useQuery(undefined, {
        refetchInterval: 30000,
    });

    return (
        <div className="relative h-full flex flex-col gap-8">
            {/* Overview Block */}
            <Stack gap="xs">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        <Title order={3} className="text-white tracking-tight">Trạng thái hệ thống</Title>
                    </div>

                    <Link href="/login" passHref>
                        <Button
                            variant="light"
                            color="indigo"
                            size="xs"
                            leftSection={<IconLogin size={14} />}
                            className="bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors"
                        >
                            Đăng nhập Admin
                        </Button>
                    </Link>
                </div>

                <WorkerGrid servers={servers} />
            </Stack>

            {/* History Tracking Section */}
            <div className="glass-card p-6">
                <Stack gap="xl">
                    <div className="flex items-center gap-2">
                        <IconClock size={20} className="text-indigo-400" />
                        <Text fw={600} className="text-white">Lịch sử Uptime</Text>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {servers.map(server => (
                            <div key={server._id} className="space-y-3">
                                <Group justify="space-between">
                                    <Text size="sm" fw={600} className="text-slate-300">{server.name}</Text>
                                    <Badge variant="dot" color={new Date(server.heartbeat).getTime() > Date.now() - 30000 ? "emerald" : "rose"} suppressHydrationWarning>
                                        {new Date(server.heartbeat).getTime() > Date.now() - 30000 ? "Hoạt động" : "Gián đoạn"}
                                    </Badge>
                                </Group>
                                <StatusHistory serverId={server._id} history={historyData || []} />
                            </div>
                        ))}
                    </div>
                </Stack>
            </div>

            {/* Recent Incidents Section */}
            <div className="glass-card p-6">
                <Stack gap="md">
                    <div className="flex items-center gap-2 mb-2">
                        <IconAlertTriangle size={20} className="text-rose-400" />
                        <Text fw={600} className="text-white">Sự cố gần đây</Text>
                    </div>
                    <RecentIncidents incidents={incidentData || []} />
                </Stack>
            </div>

            <Text size="xs" className="text-slate-600 text-center mt-auto pb-4">
                * Lịch sử được ghi nhận bởi standalone monitor agent.
            </Text>
        </div>
    );
}
