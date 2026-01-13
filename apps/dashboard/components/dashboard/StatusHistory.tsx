import { Group, Stack, Text, Tooltip } from "@mantine/core";
import { useMemo } from "react";

interface StatusHistoryProps {
    serverId: string;
    history: any[];
}

export default function StatusHistory({ serverId, history }: StatusHistoryProps) {
    // Generate last 24 hours slots
    const bars = useMemo(() => {
        const slots = [];
        const now = new Date();

        for (let i = 23; i >= 0; i--) {
            const targetHour = new Date(now.getTime() - i * 60 * 60 * 1000);
            targetHour.setMinutes(0, 0, 0);

            const entry = history.find(h =>
                h.serverId === serverId &&
                new Date(h.hour).getTime() === targetHour.getTime()
            );

            slots.push({
                time: targetHour,
                online: !!entry,
            });
        }
        return slots;
    }, [serverId, history]);

    const uptimePercentage = useMemo(() => {
        const onlineCount = bars.filter(b => b.online).length;
        return Math.round((onlineCount / bars.length) * 100);
    }, [bars]);

    return (
        <Stack gap={4}>
            <Group justify="space-between">
                <Text size="xs" fw={600} className="text-slate-400">Lịch sử 24h</Text>
                <Text size="xs" fw={700} className={uptimePercentage > 95 ? "text-emerald-400" : "text-amber-400"}>
                    {uptimePercentage}% Độ ổn định
                </Text>
            </Group>

            <Group gap={2} wrap="nowrap" className="h-6">
                {bars.map((bar, idx) => (
                    <Tooltip
                        key={idx}
                        label={`${bar.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${bar.online ? 'Ổn định' : 'Mất kết nối / Không có dữ liệu'}`}
                        position="top"
                        withArrow
                    >
                        <div
                            className={`flex-1 h-full rounded-sm transition-colors ${bar.online ? 'bg-emerald-500/80 hover:bg-emerald-400' : 'bg-slate-800 hover:bg-slate-700'
                                }`}
                        />
                    </Tooltip>
                ))}
            </Group>

            <Group justify="space-between" className="px-0.5">
                <Text size="[10px]" className="text-slate-600">24h trước</Text>
                <Text size="[10px]" className="text-slate-600">Hiện tại</Text>
            </Group>
        </Stack>
    );
}
