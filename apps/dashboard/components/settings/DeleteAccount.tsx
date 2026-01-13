import { Accordion, Button, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconTrash } from "@tabler/icons-react";
import { signOut } from "next-auth/react";

import { sendNotification } from "@/utils/notification";
import { trpc } from "@/utils/trpc";

export default function DeleteAccount() {
  const deleteForm = useForm({
    initialValues: {
      password: "",
    },
    validate: {
      password: (val) => (val.length <= 6 ? "Mật khẩu phải có ít nhất 6 ký tự" : null),
    },
  });

  const deleteAccount = trpc.user.deleteAccount.useMutation({
    onSuccess(data) {
      sendNotification("deleteAccount", "Thành công", data, "success");
      signOut();
    },
    onError(error) {
      sendNotification("deleteAccount", "Thất bại", error.message, "error");
      deleteForm.setFieldError("password", error.message);
    },
  });

  return (
    <Accordion.Item value="delete">
      <Accordion.Control
        icon={
          <IconTrash
            style={{
              marginTop: "0.1rem",
            }}
          />
        }
      >
        <Title order={5}>Xóa tài khoản</Title>
      </Accordion.Control>
      <Accordion.Panel px="xs">
        <form onSubmit={deleteForm.onSubmit((values) => deleteAccount.mutate({ password: values.password }))}>
          <Stack my={"xs"}>
            <TextInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu để xác nhận"
              required
              type="password"
              {...deleteForm.getInputProps("password")}
            />
            <Button type="submit" variant="light" color="red" loading={deleteAccount.isPending}>
              Xóa tài khoản
            </Button>
          </Stack>
        </form>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
