import { ActionIcon, Checkbox, Group, NativeSelect, Table, Text } from "@mantine/core";
import { IconMail, IconTrash } from "@tabler/icons-react";
import cx from "clsx";

import { GithubIcon } from "@/components/icons/github";
import { GoogleIcon } from "@/components/icons/google";
import { actionNotification } from "@/utils/notification";
import { trpc } from "@/utils/trpc";

interface UserItemProps {
  selected: boolean;
  selectUser: (userId: string) => void;
  refresh: () => void;
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "custom" | "none";
  authProvider: "github" | "google" | undefined;
}

export default function UserItem({
  selected,
  selectUser,
  userId,
  name,
  email,
  authProvider,
  role,
  refresh,
}: UserItemProps) {
  const selectDisabled = role == "admin" || role == "owner";
  const userRoles = ["OWNER", "ADMIN", "CUSTOM", "NONE"] as const;
  type UserRole = (typeof userRoles)[number];

  const deleteUser = trpc.user.deleteUser.useMutation({
    onMutate({ userId }) {
      actionNotification(userId, `Deleting user: ${name}`, `Please Wait ...`, "pending");
    },
    onError(error) {
      actionNotification(userId, `Failed to delete user: ${name}`, error.message, "error");
    },
    onSuccess(data) {
      actionNotification(userId, `Deleted User: ${name}`, data, "success");
      refresh();
    },
  });

  const updateUser = trpc.user.updateRole.useMutation({
    onMutate({ userId, role }) {
      actionNotification(userId, `Updating role to ${capitalizeFirst(role)}`, `Please Wait ...`, "pending");
    },
    onError(error, { role }) {
      actionNotification(userId, `Failed to update role to ${capitalizeFirst(role)}`, error.message, "error");
    },
    onSuccess(data, { role }) {
      actionNotification(userId, `Updated role to ${capitalizeFirst(role)}`, data, "success");
      refresh();
    },
  });

  return (
    <Table.Tr
      className={cx(
        "transition-colors",
        selected ? "bg-indigo-500/10" : "hover:bg-slate-800/30"
      )}
      data-cy="user-item"
      data-cy-id={email}
    >
      <Table.Td>
        <Checkbox
          checked={selected}
          onChange={() => selectUser(userId)}
          disabled={selectDisabled}
          data-cy="user-item-select"
          classNames={{
            input: "bg-slate-800/50 border-slate-700/50 checked:bg-indigo-500 checked:border-indigo-500",
          }}
        />
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          <div className="text-slate-400">
            {!authProvider && <IconMail size={18} />}
            {authProvider == "github" && <GithubIcon width={18} height={18} />}
            {authProvider == "google" && <GoogleIcon width={18} height={18} />}
          </div>
          <Text size="sm" fw={500} className="text-slate-200" data-cy="user-item-name">
            {name}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td className="text-slate-400 font-mono text-xs" data-cy="user-item-email">
        {email}
      </Table.Td>
      <Table.Td>
        <NativeSelect
          data={userRoles.map((x) => {
            return {
              label: capitalizeFirst(x),
              value: x,
              disabled: x == "CUSTOM",
            };
          })}
          variant="filled"
          value={role.toUpperCase()}
          disabled={updateUser.isPending}
          data-cy="user-item-role"
          className="max-w-[120px]"
          classNames={{
            input: "bg-slate-800/50 border-slate-700/50 text-slate-200 text-xs h-8 px-2 focus:border-indigo-500/50",
          }}
          onChange={(e) => {
            const role = e.target.value as UserRole;
            updateUser.mutate({ userId, role: role });
          }}
        />
      </Table.Td>
      <Table.Td>
        <ActionIcon
          variant="subtle"
          color="rose"
          radius="md"
          size="lg"
          className="text-rose-400 hover:bg-rose-500/10"
          loading={deleteUser.isPending}
          onClick={() => deleteUser.mutate({ userId: userId })}
          data-cy="user-item-delete"
        >
          <IconTrash size={18} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}

function capitalizeFirst(str: string): string {
  const lw = str.toLowerCase();
  return lw.charAt(0).toUpperCase() + lw.slice(1);
}
