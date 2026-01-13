import { Anchor, Flex, Paper, Popover, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IProcess } from "@pm2.web/typings";
import { IconGitMerge } from "@tabler/icons-react";

export default function ProcessGitMetric({ versioning }: { versioning?: IProcess["versioning"] }) {
  const [opened, { close, open }] = useDisclosure(false);

  return (
    <Popover withArrow shadow="md" opened={opened} trapFocus position="top">
      <Popover.Target>
        <Paper
          className="bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 transition-colors cursor-help"
          radius="lg"
          p={"4px"}
          px={"10px"}
          onMouseEnter={open}
          onMouseLeave={close}
        >
          <Flex align={"center"} justify={"space-between"} gap={"xs"} w={"auto"}>
            <IconGitMerge size={14} className="text-indigo-400" />
            <Anchor
              href={`${versioning?.url?.replace(".git", "")}/commit/${versioning?.revision}`}
              target="_blank"
              underline="hover"
              className="text-xs font-mono text-slate-200 hover:text-indigo-400"
            >
              {versioning?.branch}
              {versioning?.unstaged && <span className="text-rose-500 ml-0.5">*</span>}
            </Anchor>
          </Flex>
        </Paper>
      </Popover.Target>
      <Popover.Dropdown className="bg-slate-900 border border-slate-700 shadow-xl pointer-events-none">
        {versioning?.comment?.split("\n")?.map((t, tIdx) => (
          <Text size="xs" key={tIdx} className="text-slate-300">
            {t}
          </Text>
        ))}
      </Popover.Dropdown>
    </Popover>
  );
}
