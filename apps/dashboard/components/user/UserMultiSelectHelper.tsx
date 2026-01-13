import { Avatar, Flex, Group, Text } from "@mantine/core";
import { IconChartBar, IconHistory, IconPower, IconReload, IconTrash } from "@tabler/icons-react";

export const permissionData = [
  {
    icon: <IconHistory />,
    value: "LOGS",
    label: "Logs",
    description: "Xem logs",
  },
  {
    icon: <IconChartBar />,
    value: "MONITORING",
    label: "Monitoring",
    description: "Xem giám sát/thống kê",
  },
  {
    icon: <IconReload />,
    value: "RESTART",
    label: "Restart",
    description: "Khởi động lại (Restart)",
  },
  {
    icon: <IconPower />,
    value: "STOP",
    label: "Stop",
    description: "Dừng (Stop)",
  },
  {
    icon: <IconTrash />,
    value: "DELETE",
    label: "Delete",
    description: "Xóa (Delete)",
  },
];

export const SelectItemComponent = (item: (typeof permissionData)[0]) => (
  <Group wrap="nowrap">
    <Avatar size={"xs"}>{item.icon}</Avatar>
    <div>
      <Text size="sm">{item.description}</Text>
    </div>
  </Group>
);

export const PillComponent = (item: (typeof permissionData)[0]) => (
  <Flex align={"center"} justify={"center"} h={"100%"}>
    <Avatar size={"xs"}>{item.icon}</Avatar>
  </Flex>
);
