import {
  Accordion,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Overlay,
  rem,
  ScrollArea,
  Transition,
} from "@mantine/core";
import { IAclServer } from "@pm2.web/typings";
import { IconCircleFilled, IconDeviceFloppy, IconShieldCheck, IconUsers } from "@tabler/icons-react";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import React, { useEffect, useState } from "react";

import { Dashboard } from "@/components/layouts/Dashboard";
import { CustomMultiSelect } from "@/components/misc/MultiSelect/CustomMultiSelect";
import UserManagement from "@/components/user/UserManagement";
import { permissionData, PillComponent, SelectItemComponent } from "@/components/user/UserMultiSelectHelper";
import { getServerSideHelpers } from "@/server/helpers";
import { actionNotification } from "@/utils/notification";
import { IPermissionConstants, Permission, PERMISSIONS } from "@/utils/permission";
import { trpc } from "@/utils/trpc";

export default function User({ }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const dashboardQuery = trpc.server.getDashBoardData.useQuery(true);
  const usersQuery = trpc.user.getUsers.useQuery();
  const servers = dashboardQuery.data?.servers || []!;
  const users = usersQuery.data || [];

  const [selection, setSelection] = useState<string[]>([]);
  const [perms, setPerms] = useState<IAclServer[]>(
    servers.map((server) => ({
      server: server._id,
      processes: server.processes.map((process) => ({
        process: process._id,
        perms: 0,
      })),
      perms: 0,
    })),
  );

  const updatePerms = trpc.user.setCustomPermission.useMutation({
    onMutate() {
      actionNotification(`update-perms`, "Đang cập nhật quyền hạn", "Vui lòng đợi...", "pending");
    },
    onError(error) {
      actionNotification(`update-perms`, "Cập nhật quyền hạn thất bại", error.message, "error");
    },
    onSuccess(data) {
      actionNotification(`update-perms`, "Cập nhật quyền hạn thành công", data, "success");
      usersQuery.refetch();
    },
  });

  const updatePermsState = (server_id: string, process_id: string, new_perms: string[]) => {
    const newPerms = [...perms];
    const serverIndex = newPerms.findIndex((x) => x.server == server_id);
    if (serverIndex !== -1) {
      if (process_id) {
        const processIndex = newPerms[serverIndex].processes.findIndex((x) => x.process == process_id);
        if (processIndex !== -1) {
          newPerms[serverIndex].processes[processIndex].perms = new Permission().add(
            ...new_perms.map((x) => PERMISSIONS[x as keyof IPermissionConstants]),
          ).value;
        }
      } else {
        newPerms[serverIndex].perms = new Permission().add(
          ...new_perms.map((x) => PERMISSIONS[x as keyof IPermissionConstants]),
        ).value;
        newPerms[serverIndex].processes = newPerms[serverIndex].processes.map((process) => ({
          ...process,
          perms: new Permission().add(...new_perms.map((x) => PERMISSIONS[x as keyof IPermissionConstants])).value,
        }));
      }
    }
    setPerms(newPerms);
  };

  const getSelectedPerms = (server_id: string, process_id?: string) => {
    const server = perms.find((x) => x.server == server_id);
    if (server) {
      if (process_id) {
        const process = server.processes.find((x) => x.process == process_id);
        if (process) {
          return new Permission(process.perms).toArray();
        }
      } else {
        return new Permission(server.perms).toArray();
      }
    }
    return [];
  };

  useEffect(() => {
    if (perms.length === 0) return;
    const selectedUsers = users.filter((x) => selection.includes(x._id));
    const newPerms = [...perms];

    for (const perm of newPerms) {
      perm.perms = new Permission().add(
        ...Permission.common(
          ...selectedUsers.map((x) => x.acl.servers.find((y) => y.server == perm.server)?.perms ?? 0),
        ),
      ).value;
      perm.processes = perm.processes.map((process) => ({
        ...process,
        perms: new Permission().add(
          ...Permission.common(
            ...selectedUsers.map(
              (x) =>
                x.acl.servers.find((y) => y.server == perm.server)?.processes.find((z) => z.process == process.process)
                  ?.perms ?? perm.perms,
            ),
          ),
        ).value,
      }));
    }

    setPerms(newPerms);
  }, [selection]);

  return (
    <>
      <Head>
        <title>PM2 Monitor - Quản trị người dùng</title>
        <meta name="description" content="PM2 Monitor User Administration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
      <Dashboard>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <IconUsers size={20} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">
                Quản trị người dùng
              </h1>
              <p className="text-sm text-slate-400">
                Quản lý người dùng và quyền truy cập mã nguồn
              </p>
            </div>
          </div>

          {/* Main Grid */}
          <Grid gutter="md">
            {/* User Management */}
            <UserManagement
              refreshUsers={usersQuery.refetch}
              users={users}
              selection={selection}
              setSelection={setSelection}
            />

            {/* Custom Permissions */}
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <div className="glass-card p-6 h-full">
                <Flex direction="column" h="100%">
                  <div className="flex items-center gap-2 mb-6">
                    <IconShieldCheck size={18} className="text-emerald-400" />
                    <h2 className="text-lg font-medium text-white">Phân quyền tùy chỉnh</h2>
                  </div>

                  <Flex direction="column" justify="space-between" h="100%" className="relative">
                    <ScrollArea h={450} className="custom-scrollbar">
                      <Accordion
                        chevronPosition="left"
                        variant="separated"
                        radius="lg"
                        classNames={{
                          item: "bg-slate-800/50 border border-slate-700/50 mb-2",
                          control: "text-slate-200 hover:bg-slate-700/30",
                          label: "text-sm font-medium",
                          panel: "p-0",
                          content: "p-0",
                          chevron: "text-slate-400",
                        }}
                      >
                        {servers.map((item) => (
                          <Accordion.Item value={item._id} key={item._id}>
                            <Flex
                              align="center"
                              direction="row"
                              justify={{ base: "start", sm: "space-between" }}
                              wrap={{ base: "wrap", sm: "nowrap" }}
                              gap="sm"
                            >
                              <Accordion.Control>
                                <Flex align="center" direction="row" gap={rem(6)}>
                                  <IconCircleFilled
                                    size={10}
                                    className={
                                      new Date(item.updatedAt).getTime() > Date.now() - 1000 * 60 * 4
                                        ? "text-emerald-400"
                                        : "text-rose-500"
                                    }
                                  />
                                  <span className="text-slate-200">{item.name}</span>
                                </Flex>
                              </Accordion.Control>
                              <CustomMultiSelect
                                value={getSelectedPerms(item._id)}
                                onChange={(values) => updatePermsState(item._id, "", values)}
                                data={permissionData}
                                itemComponent={SelectItemComponent}
                                pillComponent={PillComponent}
                                placeholder="Chọn quyền hạn"
                                variant="filled"
                                radius="lg"
                                size="sm"
                                w={{ sm: "20rem" }}
                                classNames={{
                                  input: "bg-slate-800/50 border-slate-700/50",
                                }}
                              />
                            </Flex>
                            <Accordion.Panel>
                              <div className="px-4 py-2">
                                {item.processes?.map((process, idx) => (
                                  <div key={process._id}>
                                    <Box py="xs">
                                      <Flex
                                        align="center"
                                        direction="row"
                                        justify="space-between"
                                        wrap={{ base: "wrap", sm: "nowrap" }}
                                        gap="sm"
                                      >
                                        <Flex align="center" direction="row" gap={rem(6)}>
                                          <IconCircleFilled
                                            size={8}
                                            className={
                                              process.status === "online"
                                                ? "text-emerald-400"
                                                : process.status === "stopped"
                                                  ? "text-amber-400"
                                                  : "text-rose-500"
                                            }
                                          />
                                          <span className="text-sm text-slate-300">{process.name}</span>
                                        </Flex>
                                        <CustomMultiSelect
                                          value={getSelectedPerms(item._id, process._id)}
                                          data={permissionData}
                                          itemComponent={SelectItemComponent}
                                          pillComponent={PillComponent}
                                          placeholder="Permissions"
                                          onChange={(values) => updatePermsState(item._id, process._id, values)}
                                          variant="filled"
                                          radius="lg"
                                          size="xs"
                                          w="14rem"
                                          classNames={{
                                            input: "bg-slate-900/50 border-slate-700/50",
                                          }}
                                        />
                                      </Flex>
                                    </Box>
                                    {idx < item.processes.length - 1 && (
                                      <Divider className="border-slate-700/50" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </Accordion.Panel>
                          </Accordion.Item>
                        ))}
                      </Accordion>

                      {/* Select User Overlay */}
                      <Transition mounted={!selection?.length} transition="fade" duration={300}>
                        {(styles) => (
                          <Overlay
                            color="#020617"
                            backgroundOpacity={0.8}
                            radius="lg"
                            blur={8}
                            center
                            style={styles}
                          >
                            <div className="flex flex-col items-center gap-3">
                              <IconUsers size={32} className="text-slate-500" />
                              <Badge
                                size="lg"
                                variant="outline"
                                className="border-slate-600 text-slate-400"
                              >
                                Chọn một người dùng trước
                              </Badge>
                            </div>
                          </Overlay>
                        )}
                      </Transition>
                    </ScrollArea>

                    {/* Save Button */}
                    <Flex justify="flex-end" mt="md">
                      <Button
                        radius="lg"
                        size="sm"
                        leftSection={<IconDeviceFloppy size={16} />}
                        loading={updatePerms.isPending}
                        disabled={selection.length === 0}
                        onClick={() =>
                          updatePerms.mutate({
                            userIds: selection,
                            perms: perms,
                          })
                        }
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-0"
                      >
                        Lưu quyền hạn
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              </div>
            </Grid.Col>
          </Grid>
        </div>
      </Dashboard>
    </>
  );
}

export async function getServerSideProps() {
  const helpers = await getServerSideHelpers();

  await helpers.server.getDashBoardData.prefetch();
  await helpers.user.getUsers.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}
