import { Tooltip } from "@mantine/core";
import { IconPlayerStop, IconRefresh, IconTrash } from "@tabler/icons-react";
import { useSession } from "next-auth/react";

import { sendNotification } from "@/utils/notification";
import { trpc } from "@/utils/trpc";

interface ProcessActionProps {
  processId: string;
}

export default function ProcessAction({ processId }: ProcessActionProps) {
  const { data: session } = useSession();
  const processAction = trpc.process.action.useMutation({
    onSuccess(data, variables) {
      if (!data) {
        sendNotification(
          variables.action + processId,
          `Thao tác ${variables.action} thất bại`,
          `Server không phản hồi`,
          `error`
        );
      }
    },
  });

  const isLoading = processAction.isPending;
  const currentAction = processAction.variables?.action;

  const ActionButton = ({
    action,
    icon: Icon,
    label,
    colorClass,
    hoverClass
  }: {
    action: "RESTART" | "STOP" | "DELETE";
    icon: any;
    label: string;
    colorClass: string;
    hoverClass: string;
  }) => (
    <Tooltip label={label} position="top">
      <button
        onClick={() => processAction.mutate({ processId, action })}
        disabled={isLoading}
        className={`
          btn-icon btn-secondary
          ${hoverClass}
          ${isLoading && currentAction === action ? "opacity-50" : ""}
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        `}
      >
        {isLoading && currentAction === action ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Icon size={16} className={colorClass} />
        )}
      </button>
    </Tooltip>
  );

  if (!session) return null;

  return (
    <div className="flex items-center gap-1.5">
      {/* Restart */}
      <ActionButton
        action="RESTART"
        icon={IconRefresh}
        label="Khởi động lại (Restart)"
        colorClass="text-slate-400"
        hoverClass="hover:text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/30"
      />

      {/* Stop */}
      <ActionButton
        action="STOP"
        icon={IconPlayerStop}
        label="Dừng (Stop)"
        colorClass="text-slate-400"
        hoverClass="hover:text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/30"
      />

      {/* Delete */}
      <ActionButton
        action="DELETE"
        icon={IconTrash}
        label="Xóa (Delete)"
        colorClass="text-slate-400"
        hoverClass="hover:text-rose-400 hover:bg-rose-400/10 hover:border-rose-400/30"
      />
    </div>
  );
}
