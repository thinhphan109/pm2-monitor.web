import { Button, Modal, PinInput, Stack, Text, Title } from "@mantine/core";
import { IconLock, IconShieldCheck } from "@tabler/icons-react";
import { useState } from "react";
import { trpc } from "@/utils/trpc";

interface PinModalProps {
    opened: boolean;
    onSuccess: () => void;
}

export default function PinModal({ opened, onSuccess }: PinModalProps) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const verifyMutation = trpc.setting.verifyProcessPin.useMutation();

    const handleSubmit = async () => {
        if (pin.length < 4) {
            setError("Vui lòng nhập đủ mã PIN");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await verifyMutation.mutateAsync({ pin });
            if (result.success) {
                // Save to sessionStorage for 1 hour
                const expiry = Date.now() + 60 * 60 * 1000; // 1 hour
                sessionStorage.setItem("processPinAccess", JSON.stringify({ expiry }));
                onSuccess();
            } else {
                setError("Mã PIN không đúng");
                setPin("");
            }
        } catch (err) {
            setError("Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={() => { }}
            withCloseButton={false}
            centered
            size="sm"
            radius="lg"
            overlayProps={{
                backgroundOpacity: 0.7,
                blur: 10,
            }}
            classNames={{
                content: "bg-slate-900 border border-slate-700",
                header: "bg-transparent",
            }}
        >
            <Stack gap="lg" align="center" className="py-4">
                {/* Icon */}
                <div className="p-4 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                    <IconLock size={32} className="text-indigo-400" />
                </div>

                {/* Title */}
                <div className="text-center">
                    <Title order={3} className="text-white mb-2">
                        Xác thực truy cập
                    </Title>
                    <Text size="sm" className="text-slate-400">
                        Nhập mã PIN để xem thông tin Process
                    </Text>
                </div>

                {/* PIN Input */}
                <PinInput
                    length={6}
                    value={pin}
                    onChange={(value) => {
                        setPin(value);
                        setError("");
                    }}
                    type="number"
                    mask
                    size="lg"
                    classNames={{
                        input: "bg-slate-800 border-slate-700 text-white font-mono",
                    }}
                />

                {/* Error Message */}
                {error && (
                    <Text size="sm" className="text-rose-400">
                        {error}
                    </Text>
                )}

                {/* Submit Button */}
                <Button
                    fullWidth
                    size="md"
                    loading={loading}
                    onClick={handleSubmit}
                    leftSection={<IconShieldCheck size={18} />}
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
                >
                    Xác nhận
                </Button>

                {/* Admin Login Link */}
                <Text size="xs" className="text-slate-500">
                    Bạn là Admin?{" "}
                    <a href="/login" className="text-indigo-400 hover:text-indigo-300">
                        Đăng nhập tại đây
                    </a>
                </Text>
            </Stack>
        </Modal>
    );
}
