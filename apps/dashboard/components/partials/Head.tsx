import { ActionIcon, AppShell, Burger, Flex, Group, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IProcess } from "@pm2.web/typings";
import {
  IconCircleFilled,
  IconDatabaseCog,
  IconFilterCog,
  IconLock,
  IconServer,
  IconServerCog
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";

import Access from "@/utils/access";

import { useSelected } from "../context/SelectedProvider";
import { CustomMultiSelect, IItem } from "../misc/MultiSelect/CustomMultiSelect";

interface HeadProps {
  mobileOpened: boolean;
  toggleMobile: () => void;
}

export function Head({ mobileOpened, toggleMobile }: HeadProps) {
  const { servers, selectItem, selectedItem } = useSelected();
  const { data: session } = useSession();
  const [filterOpened, { open: openFilter, close: closeFilter }] = useDisclosure(false);

  const hasAccess = (server_id: string, process_id: string) => {
    const user = session?.user;
    // If no user (guest with PIN), allow viewing all
    if (!user || !user.acl) return true;
    if (!user?.acl?.owner && !user?.acl?.admin) {
      return !!new Access(user.acl?.servers ?? []).getPermsValue(server_id, process_id);
    }
    return true;
  };

  const MultiSelectItems = (
    <>
      {!!servers?.length && (
        <>
          {/* Server Select */}
          <CustomMultiSelect
            leftSection={<IconServerCog size={18} className="text-slate-400" />}
            data={
              servers?.map((server) => ({
                value: server._id,
                label: server.name,
                status: new Date(server.updatedAt).getTime() > Date.now() - 1000 * 60 ? "online" : "offline",
                disabled: !server.processes.some((process) => hasAccess(server._id, process._id)),
              })) || []
            }
            onChange={(values) => {
              selectItem?.(values, "servers");
            }}
            itemComponent={itemComponent}
            placeholder="Chọn Server"
            searchable
            w={{ base: "100%", md: "14rem" }}
            radius="lg"
            classNames={{
              input: "bg-slate-900/50 border-slate-700/50 text-sm",
              dropdown: "bg-slate-900 border-slate-700/50",
            }}
            hidePickedOptions
          />

          {/* Process Select */}
          <CustomMultiSelect
            leftSection={<IconDatabaseCog size={18} className="text-slate-400" />}
            data={
              servers
                ?.map(
                  (server) =>
                    server.processes
                      ?.filter(() => selectedItem?.servers.includes(server._id) || selectedItem?.servers.length === 0)
                      ?.map((process) => ({
                        value: process._id,
                        label: process.name,
                        status: process.status,
                        disabled: !hasAccess(server._id, process._id),
                      })) || [],
                )
                .flat() || []
            }
            itemComponent={itemComponent}
            value={selectedItem?.processes || []}
            onChange={(values) => {
              selectItem(values, "processes");
            }}
            placeholder="Chọn Process"
            searchable
            w={{ base: "100%", md: "14rem" }}
            maxValues={4}
            radius="lg"
            withScrollArea
            maxDropdownHeight={200}
            classNames={{
              input: "bg-slate-900/50 border-slate-700/50 text-sm",
              dropdown: "bg-slate-900 border-slate-700/50",
            }}
            comboboxProps={{
              position: "bottom",
              middlewares: { flip: false, shift: false },
            }}
            hidePickedOptions
          />
        </>
      )}
    </>
  );

  return (
    <AppShell.Header className="glass-header">
      {/* Filter Modal for Mobile */}
      <Modal
        opened={filterOpened}
        onClose={closeFilter}
        title="Lọc Server & Process"
        centered
        size="sm"
        radius="lg"
        classNames={{
          header: "bg-transparent",
          title: "text-slate-200 font-medium",
          close: "text-slate-400 hover:text-slate-200",
        }}
      >
        <Stack gap="md">{MultiSelectItems}</Stack>
      </Modal>

      <Flex h="100%" px="md" align="center" justify="space-between">
        {/* Left: Mobile Burger + Logo */}
        <Group gap="sm">
          {/* Mobile Hamburger */}
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            size="sm"
            className="lg:hidden"
            color="white"
          />

          {/* Logo */}
          <Group gap="xs">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700">
              <IconServer size={18} className="text-white" />
            </div>
            <span className="hidden sm:block text-lg font-semibold text-white tracking-tight">
              PM2 Monitor
            </span>
          </Group>
        </Group>

        {/* Center: Desktop Filter Selects */}
        {session?.user && (
          <Group gap="sm" className="hidden lg:flex">
            {MultiSelectItems}
          </Group>
        )}

        {/* Right: Mobile Filter Button */}
        {session?.user && (
          <Group gap="xs" className="lg:hidden">
            <ActionIcon
              variant="subtle"
              radius="lg"
              size="lg"
              onClick={openFilter}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            >
              <IconFilterCog size={20} />
            </ActionIcon>
          </Group>
        )}

        {/* Right: Empty space for desktop alignment */}
        <div className="hidden lg:block w-8" />
      </Flex>
    </AppShell.Header>
  );
}

function itemComponent(opt: IItem & { status: IProcess["status"] }) {
  return (
    <Flex align="center" gap="sm" className="py-1">
      {opt.disabled ? (
        <IconLock size={12} className="text-slate-500" />
      ) : (
        <IconCircleFilled
          size={8}
          className={
            opt.status === "online"
              ? "text-emerald-400"
              : opt.status === "stopped"
                ? "text-amber-400"
                : "text-rose-500"
          }
          style={{
            filter: opt.status === "online"
              ? "drop-shadow(0 0 4px rgb(52 211 153 / 0.6))"
              : undefined
          }}
        />
      )}
      <span className="text-sm text-slate-200">{opt.label}</span>
    </Flex>
  );
}
