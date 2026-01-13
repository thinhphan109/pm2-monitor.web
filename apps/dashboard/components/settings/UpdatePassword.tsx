import { Accordion, Button, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconRefresh } from "@tabler/icons-react";
import { ZodError } from "zod";

import { sendNotification } from "@/utils/notification";
import { trpc } from "@/utils/trpc";

export default function UpdatePassword() {
  const passwordForm = useForm({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      oldPassword: (val) => (val.length <= 6 ? "Mật khẩu phải có ít nhất 6 ký tự" : null),
      newPassword: (val) => (val.length <= 6 ? "Mật khẩu phải có ít nhất 6 ký tự" : null),
      confirmPassword: (val) => (val.length <= 6 ? "Mật khẩu phải có ít nhất 6 ký tự" : null),
    },
  });

  const changePassword = trpc.user.changePassword.useMutation({
    onSuccess(data) {
      sendNotification("changePassword", "Thành công", data, "success");
    },
    onError(error) {
      let errorMessage = error.message;
      try {
        const zodErrors = JSON.parse(error.message) as ZodError["errors"];
        errorMessage = zodErrors?.[0]?.message;
        passwordForm.setFieldError(zodErrors?.[0]?.path?.[0] as string, errorMessage);
      } catch {
        passwordForm.setFieldError("oldPassword", errorMessage);
      }

      sendNotification("changePassword", "Thất bại", errorMessage, "error");
    },
  });

  return (
    <Accordion.Item value="password">
      <Accordion.Control
        icon={
          <IconRefresh
            style={{
              marginTop: "0.1rem",
            }}
          />
        }
      >
        <Title order={5}>Đổi mật khẩu</Title>
      </Accordion.Control>
      <Accordion.Panel px="xs">
        <form onSubmit={passwordForm.onSubmit((values) => changePassword.mutate(values))}>
          <Stack my={"xs"}>
            <TextInput
              label="Mật khẩu cũ"
              placeholder="Nhập mật khẩu cũ"
              required
              type="password"
              {...passwordForm.getInputProps("oldPassword")}
            />
            <TextInput
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              required
              type="password"
              {...passwordForm.getInputProps("newPassword")}
            />
            <TextInput
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              required
              type="password"
              {...passwordForm.getInputProps("confirmPassword")}
            />
            <Button type="submit" variant="light" color="blue">
              Cập nhật mật khẩu
            </Button>
          </Stack>
        </form>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
