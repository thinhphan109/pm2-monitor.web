import {
    Accordion,
    Button,
    PasswordInput,
    Select,
    Stack,
    TextInput,
    Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUserPlus } from "@tabler/icons-react";

import { sendNotification } from "@/utils/notification";
import { trpc } from "@/utils/trpc";

export default function AddUser() {
    const form = useForm({
        initialValues: {
            email: "",
            name: "",
            password: "",
            role: "NONE" as "ADMIN" | "CUSTOM" | "NONE",
        },
        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : "Email không hợp lệ"),
            name: (val) => (val.length < 1 ? "Vui lòng nhập tên" : null),
            password: (val) => (val.length < 6 ? "Mật khẩu phải có ít nhất 6 ký tự" : null),
        },
    });

    const utils = trpc.useUtils();
    const createUser = trpc.user.createUser.useMutation({
        onSuccess(data) {
            sendNotification("createUser", "Thành công", data, "success");
            form.reset();
            utils.user.getUsers.invalidate();
        },
        onError(error) {
            sendNotification("createUser", "Thất bại", error.message, "error");
        },
    });

    return (
        <Accordion.Item value="add-user" className="border-none bg-transparent">
            <Accordion.Control className="hover:bg-slate-800/30 rounded-lg">
                <Title order={5} className="text-slate-200">Thêm người dùng</Title>
            </Accordion.Control>
            <Accordion.Panel px="xs" className="pt-4">
                <form onSubmit={form.onSubmit((values) => createUser.mutate(values))}>
                    <Stack gap="md">
                        <TextInput
                            label="Họ tên"
                            placeholder="Tên người dùng"
                            required
                            {...form.getInputProps("name")}
                            classNames={{
                                input: "bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-indigo-500/50",
                                label: "text-slate-300 font-medium",
                            }}
                        />

                        <TextInput
                            label="Email"
                            placeholder="user@example.com"
                            required
                            {...form.getInputProps("email")}
                            classNames={{
                                input: "bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-indigo-500/50",
                                label: "text-slate-300 font-medium",
                            }}
                        />

                        <PasswordInput
                            label="Mật khẩu"
                            placeholder="Tối thiểu 6 ký tự"
                            required
                            {...form.getInputProps("password")}
                            classNames={{
                                input: "bg-slate-800/50 border-slate-700/50 text-slate-200 focus:border-indigo-500/50",
                                label: "text-slate-300 font-medium",
                            }}
                        />

                        <Select
                            label="Vai trò"
                            data={[
                                { value: "ADMIN", label: "Admin - Toàn quyền" },
                                { value: "CUSTOM", label: "Custom - Có giới hạn" },
                                { value: "NONE", label: "None - Không có quyền" },
                            ]}
                            {...form.getInputProps("role")}
                            classNames={{
                                input: "bg-slate-800/50 border-slate-700/50 text-slate-200",
                                label: "text-slate-300 font-medium",
                                dropdown: "bg-slate-800 border-slate-700",
                                option: "text-slate-200 hover:bg-slate-700",
                            }}
                        />

                        <Button
                            type="submit"
                            leftSection={<IconUserPlus size={18} />}
                            loading={createUser.isPending}
                            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
                            radius="md"
                        >
                            Tạo người dùng
                        </Button>
                    </Stack>
                </form>
            </Accordion.Panel>
        </Accordion.Item>
    );
}
