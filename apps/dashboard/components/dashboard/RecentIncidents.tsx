import { Modal, ScrollArea, Table, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertTriangle } from "@tabler/icons-react";
import ms from "ms";
import { useState } from "react";

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
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    if (!incidents || incidents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
                <IconAlertTriangle size={32} className="opacity-20" />
                <Text size="sm">Không có sự cố nào gần đây.</Text>
            </div>
        );
    }

    const handleRowClick = (incident: Incident) => {
        setSelectedIncident(incident);
        open();
    };

    const rows = incidents.map((incident, index) => (
        <Table.Tr
            key={index}
            className="hover:bg-slate-800/30 transition-colors cursor-pointer"
            onClick={() => handleRowClick(incident)}
        >
            <Table.Td>
                <Text size="xs" className="text-slate-400 font-mono whitespace-nowrap" suppressHydrationWarning>
                    {ms(Math.max(0, Date.now() - new Date(incident.createdAt).getTime()))} ago
                </Text>
            </Table.Td>
            <Table.Td>
                <div className="flex flex-col">
                    <Text size="xs" fw={700} className="text-slate-200">{incident.serverName}</Text>
                    <Text size="xs" className="text-slate-500">{incident.processName}</Text>
                </div>
            </Table.Td>
            <Table.Td>
                <Text size="xs" className="text-rose-300 font-mono truncate max-w-[120px]">
                    {incident.message.length > 20 ? incident.message.substring(0, 20) + '...' : incident.message}
                </Text>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            {/* Detail Modal */}
            <Modal
                opened={opened}
                onClose={close}
                title="Chi tiết sự cố"
                centered
                size="md"
                radius="lg"
                classNames={{
                    header: "bg-slate-900 border-b border-slate-700",
                    title: "text-white font-semibold",
                    body: "bg-slate-900 p-4",
                    close: "text-slate-400 hover:text-white",
                }}
            >
                {selectedIncident && (
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div>
                                <Text size="xs" className="text-slate-500 mb-1">Server</Text>
                                <Text fw={600} className="text-white">{selectedIncident.serverName}</Text>
                            </div>
                            <div>
                                <Text size="xs" className="text-slate-500 mb-1">Process</Text>
                                <Text fw={600} className="text-slate-300">{selectedIncident.processName}</Text>
                            </div>
                        </div>
                        <div>
                            <Text size="xs" className="text-slate-500 mb-1">Thời gian</Text>
                            <Text size="sm" className="text-slate-300" suppressHydrationWarning>
                                {new Date(selectedIncident.createdAt).toLocaleString('vi-VN')}
                            </Text>
                        </div>
                        <div>
                            <Text size="xs" className="text-slate-500 mb-1">Nội dung</Text>
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <Text size="sm" className="text-rose-300 font-mono whitespace-pre-wrap break-all">
                                    {selectedIncident.message}
                                </Text>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <ScrollArea h={300} scrollbarSize={6} offsetScrollbars type="auto">
                <div className="overflow-x-auto touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <Table verticalSpacing="xs" className="w-full min-w-[400px]">
                        <Table.Thead className="sticky top-0 bg-[#0c0e14]/90 backdrop-blur-sm z-10">
                            <Table.Tr>
                                <Table.Th className="text-slate-500 text-[10px] uppercase w-20">Thời gian</Table.Th>
                                <Table.Th className="text-slate-500 text-[10px] uppercase w-24">Nguồn</Table.Th>
                                <Table.Th className="text-slate-500 text-[10px] uppercase min-w-[150px]">Chi tiết</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </div>
            </ScrollArea>
        </>
    );
}
