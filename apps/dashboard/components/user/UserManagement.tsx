import { Checkbox, Grid, Paper, rem, ScrollArea, Table } from "@mantine/core";
import { IUser } from "@pm2.web/typings";

import UserItem from "./table/UserItem";

interface UserManagementProps {
  setSelection: React.Dispatch<React.SetStateAction<string[]>>;
  selection: string[];
  users: IUser[];
  refreshUsers: () => void;
}

export default function UserManagement({ selection, setSelection, users, refreshUsers }: UserManagementProps) {
  const toggleRow = (id: string) =>
    setSelection((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const toggleAll = () =>
    setSelection((current) =>
      current.length === users.filter((x) => !x.acl.owner && !x.acl.admin).length
        ? []
        : users.filter((x) => !x.acl.owner && !x.acl.admin).map((item) => item._id),
    );

  return (
    <Grid.Col span={{ lg: 6, md: 12 }}>
      <Paper
        shadow="xl"
        radius="lg"
        p="sm"
        className="glass-card h-full border-slate-700/50 bg-slate-900/40 overflow-hidden"
      >
        <ScrollArea h={500} offsetScrollbars>
          <Table miw={600} verticalSpacing="sm" className="border-separate border-spacing-y-2 px-2">
            <Table.Thead className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md">
              <Table.Tr className="border-none">
                <Table.Th style={{ width: rem(40) }}>
                  <Checkbox
                    onChange={toggleAll}
                    checked={selection.length === users.length && users.length > 0}
                    indeterminate={selection.length > 0 && selection.length !== users.length}
                    classNames={{
                      input: "bg-slate-800/50 border-slate-700/50 checked:bg-indigo-500 checked:border-indigo-500",
                    }}
                  />
                </Table.Th>
                <Table.Th className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">User</Table.Th>
                <Table.Th className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Email</Table.Th>
                <Table.Th className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Permission</Table.Th>
                <Table.Th style={{ width: rem(50) }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((item) => (
                <UserItem
                  key={item._id}
                  selected={selection.includes(item._id)}
                  selectUser={toggleRow}
                  authProvider={item?.oauth2?.provider}
                  userId={item._id}
                  email={item.email}
                  name={item.name}
                  refresh={() => refreshUsers()}
                  role={getUserRole(item)}
                />
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </Grid.Col>
  );
}

const getUserRole = (item: Omit<IUser, "password" | "updatedAt">) => {
  return item.acl?.owner ? "owner" : item.acl?.admin ? "admin" : item.acl?.servers?.length ? "custom" : "none";
};
