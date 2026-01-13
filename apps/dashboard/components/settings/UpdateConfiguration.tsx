import {
  Accordion,
  ActionIcon,
  Button,
  Checkbox,
  CopyButton,
  Flex,
  Grid,
  Group,
  Input,
  NumberInput,
  PinInput,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { ISetting } from "@pm2.web/typings";
import { IconCheck, IconCopy, IconDeviceFloppy, IconRefresh } from "@tabler/icons-react";

import { sendNotification } from "@/utils/notification";
import { trpc } from "@/utils/trpc";

interface UpdateConfigurationProps {
  settings: ISetting;
}

export default function UpdateConfiguration({ settings }: UpdateConfigurationProps) {
  const globalConfiguration = useForm({
    initialValues: {
      polling: {
        backend: settings.polling.backend,
        frontend: settings.polling.frontend,
      },
      excludeDaemon: settings.excludeDaemon,
      logRotation: settings.logRotation,
      registrationCode: settings.registrationCode,
      showcaseMode: settings.showcaseMode,
      processPin: (settings as any).processPin || "",
    },
    validate: {
      polling: (val) =>
        val.backend < 1000 || val.frontend < 1000 ? "Thời gian cập nhật không được nhỏ hơn 1000ms" : null,
      logRotation: (val) => (val >= 10_000 ? "Log rotation không được vượt quá 10,000" : null),
      registrationCode: (val) => (val && val.length < 6 ? "Mã đăng ký phải có ít nhất 6 ký tự" : null),
      processPin: (val) => (val && val.length > 0 && val.length < 6 ? "Mã PIN phải có 6 chữ số hoặc để trống" : null),
    },
  });

  const updateSetting = trpc.setting.updateSetting.useMutation({
    onSuccess(data) {
      sendNotification("updateSetting", "Thành công", data, "success");
    },
    onError(error) {
      sendNotification("updateSetting", "Thất bại", error.message, "error");
    },
  });

  return (
    <Accordion.Item value="configuration" className="border-none bg-transparent">
      <Accordion.Control className="hover:bg-slate-800/30 rounded-lg">
        <Title order={5} className="text-slate-200">Cấu hình hệ thống</Title>
      </Accordion.Control>
      <Accordion.Panel px="xs" className="pt-4">
        <form onSubmit={globalConfiguration.onSubmit((values) => updateSetting.mutate(values))}>
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <NumberInput
                  label="Thời gian cập nhật Backend"
                  description="Tính bằng mili giây (ms)"
                  placeholder="2000"
                  required
                  {...globalConfiguration.getInputProps("polling.backend")}
                  min={1000}
                  step={500}
                  classNames={{
                    input: "bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-indigo-500/50",
                    label: "text-slate-300 font-medium",
                    description: "text-slate-500 text-xs",
                  }}
                />
                <NumberInput
                  label="Thời gian cập nhật Frontend"
                  description="Tính bằng mili giây (ms)"
                  placeholder="1000"
                  required
                  {...globalConfiguration.getInputProps("polling.frontend")}
                  min={1000}
                  step={500}
                  classNames={{
                    input: "bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-indigo-500/50",
                    label: "text-slate-300 font-medium",
                    description: "text-slate-500 text-xs",
                  }}
                />
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <NumberInput
                  label="Log Rotation"
                  description="Tự động xoay vòng log khi đạt giới hạn dòng"
                  placeholder="1000"
                  required
                  step={50}
                  {...globalConfiguration.getInputProps("logRotation")}
                  classNames={{
                    input: "bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-indigo-500/50",
                    label: "text-slate-300 font-medium",
                    description: "text-slate-500 text-xs",
                  }}
                />

                <Checkbox
                  label="Loại trừ Daemon Process"
                  description="Không hiển thị các process có tên 'pm2.web-daemon'"
                  {...globalConfiguration.getInputProps("excludeDaemon", { type: "checkbox" })}
                  classNames={{
                    label: "text-slate-300 text-sm",
                    description: "text-slate-500 text-xs",
                    input: "bg-slate-800/50 border-slate-700/50 checked:bg-indigo-500",
                  }}
                />

                <Checkbox
                  label="Chế độ Public Showcase"
                  description="Cho phép mọi người xem dashboard ở chế độ chỉ đọc mà không cần đăng nhập"
                  {...globalConfiguration.getInputProps("showcaseMode", { type: "checkbox" })}
                  classNames={{
                    label: "text-slate-300 text-sm",
                    description: "text-slate-500 text-xs",
                    input: "bg-slate-800/50 border-slate-700/50 checked:bg-indigo-500",
                  }}
                />

                <Input.Wrapper
                  label="Mã đăng ký (Registration Code)"
                  description="Mã PIN yêu cầu khi đăng ký tài khoản mới"
                  classNames={{
                    label: "text-slate-300 font-medium",
                    description: "text-slate-500 text-xs mb-2",
                  }}
                >
                  <Flex align="center" gap="sm" wrap="wrap" mt={4}>
                    <PinInput
                      length={6}
                      {...globalConfiguration.getInputProps("registrationCode")}
                      classNames={{
                        input: "bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-indigo-500/50 w-10",
                      }}
                    />

                    <Group gap="xs">
                      <ActionIcon
                        type="button"
                        variant="subtle"
                        className="text-indigo-400 hover:bg-indigo-500/10"
                        radius="md"
                        size="lg"
                        onClick={() => globalConfiguration.setFieldValue("registrationCode", randomId().slice(8, 14))}
                      >
                        <IconRefresh size={20} />
                      </ActionIcon>

                      <CopyButton value={globalConfiguration.values.registrationCode} timeout={2000}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? "Đã sao chép" : "Sao chép mã"} withArrow position="top">
                            <ActionIcon
                              variant="subtle"
                              className={copied ? "text-emerald-400" : "text-slate-400 hover:bg-slate-700/30"}
                              onClick={copy}
                              size="lg"
                              radius="md"
                            >
                              {copied ? <IconCheck size={20} /> : <IconCopy size={20} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                  </Flex>
                </Input.Wrapper>

                <Input.Wrapper
                  label="Mã PIN truy cập Process"
                  description="Mã PIN để xem trang /process (để trống để tắt)"
                  classNames={{
                    label: "text-slate-300 font-medium",
                    description: "text-slate-500 text-xs mb-2",
                  }}
                >
                  <Flex align="center" gap="sm" wrap="wrap" mt={4}>
                    <PinInput
                      length={6}
                      type="number"
                      mask
                      {...globalConfiguration.getInputProps("processPin")}
                      classNames={{
                        input: "bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-indigo-500/50 w-10",
                      }}
                    />

                    <Group gap="xs">
                      <ActionIcon
                        type="button"
                        variant="subtle"
                        className="text-indigo-400 hover:bg-indigo-500/10"
                        radius="md"
                        size="lg"
                        onClick={() => globalConfiguration.setFieldValue("processPin", randomId().slice(8, 14).replace(/\D/g, '').padStart(6, '0').slice(0, 6))}
                      >
                        <IconRefresh size={20} />
                      </ActionIcon>

                      <ActionIcon
                        type="button"
                        variant="subtle"
                        className="text-rose-400 hover:bg-rose-500/10"
                        radius="md"
                        size="lg"
                        onClick={() => globalConfiguration.setFieldValue("processPin", "")}
                      >
                        <Tooltip label="Xóa PIN" withArrow position="top">
                          <span className="text-xs font-bold">✕</span>
                        </Tooltip>
                      </ActionIcon>
                    </Group>
                  </Flex>
                </Input.Wrapper>
              </Stack>
            </Grid.Col>
          </Grid>

          <Flex justify="flex-end" mt="xl">
            <Button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-none shadow-lg shadow-emerald-900/20"
              leftSection={<IconDeviceFloppy size={18} />}
              loading={updateSetting.isPending}
              radius="md"
              size="md"
            >
              Lưu cấu hình
            </Button>
          </Flex>
        </form>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
