import { Accordion, Button, Flex, Select, Title } from "@mantine/core";
import { useForm } from "@mantine/form";

import { sendNotification } from "@/utils/notification";
import { trpc } from "@/utils/trpc";

export default function DatabaseAction() {
  const databaseAction = useForm<{ action: "deleteAll" | "deleteLogs" | "" }>({
    initialValues: {
      action: "",
    },
    validate: {
      action: (val) => (val ? null : "Vui lòng chọn một thao tác"),
    },
  });

  const deleteAll = trpc.setting.deleteAll.useMutation({
    onSuccess(data) {
      sendNotification("deleteAll", "Thành công", data, "success");
    },
    onError(error) {
      sendNotification("deleteAll", "Thất bại", error.message, "error");
    },
  });

  const deleteLogs = trpc.setting.deleteLogs.useMutation({
    onSuccess(data) {
      sendNotification("deleteLogs", "Thành công", data, "success");
    },
    onError(error) {
      sendNotification("deleteLogs", "Thất bại", error.message, "error");
    },
  });

  return (
    <Accordion.Item value="database_action">
      <Accordion.Control>
        <Title order={5}>Quản trị Database</Title>
      </Accordion.Control>
      <Accordion.Panel px="xs">
        <form
          onSubmit={databaseAction.onSubmit(async () => {
            const action = databaseAction.values.action;
            switch (action) {
              case "":
              case "deleteAll": {
                return deleteAll.mutate();
              }
              case "deleteLogs": {
                return deleteLogs.mutate();
              }
            }
          })}
        >
          <Flex align={"end"} gap={"lg"}>
            <Select
              label="Thao tác Database"
              placeholder="Chọn thao tác"
              data={[
                {
                  label: "Xóa toàn bộ Server/Process",
                  value: "deleteAll",
                },
                {
                  label: "Xóa toàn bộ Logs của Process",
                  value: "deleteLogs",
                },
              ]}
              style={{
                flex: "1",
              }}
              required
              {...databaseAction.getInputProps("action")}
            />
            <Button type="submit" variant="light" color="orange" loading={deleteAll.isPending || deleteLogs.isPending}>
              Thực thi
            </Button>
          </Flex>
        </form>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
