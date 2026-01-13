import { Badge, ScrollArea, Table, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import ms from "ms";

interface Incident {
    serverName: string;
    processName: string;
    message: string;
    createdAt: string;
}

interface RecentIncidentsProps {
    incidents: Incident[];
}

export default function RecentIncidents({ incidents }: RecentIncidentsProps) {
    if (!incidents || incidents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
                <IconAlertTriangle size={32} className="opacity-20" />
                <Text size="sm">No incidents reported recently.</Text>
            </div>
        );
    }

    const rows = incidents.map((incident, index) => (
        <Table.Tr key={index} className="hover:bg-slate-800/30 transition-colors">
            <Table.Td>
                <Text size="xs" className="text-slate-400 font-mono whitespace-nowrap" suppressHydrationWarning>
                    {ms(Math.max(0, Date.now() - new Date(incident.createdAt).getTime()))} ago
                </Text>
            </Table.Td>
            <Table.Td>
                <div className="flex flex-col">
                    <Text size="xs" fw={700} className="text-slate-200">{incident.serverName}</Text>
                    <Text size="[10px]" className="text-slate-500">{incident.processName}</Text>
                </div>
            </Table.Td>
            <Table.Td>
                <Text size="xs" className="text-rose-300 font-mono line-clamp-1" title={incident.message}>
                    {incident.message}
                </Text>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <ScrollArea h={300} scrollbarSize={6} offsetScrollbars>
            <Table verticalSpacing="xs" className="w-full">
                <Table.Thead className="sticky top-0 bg-[#0c0e14]/90 backdrop-blur-sm z-10">
                    <Table.Tr>
                        <Table.Th className="text-slate-500 text-[10px] uppercase w-24">When</Table.Th>
                        <Table.Th className="text-slate-500 text-[10px] uppercase w-32">Source</Table.Th>
                        <Table.Th className="text-slate-500 text-[10px] uppercase">Details</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </ScrollArea>
    );
}
