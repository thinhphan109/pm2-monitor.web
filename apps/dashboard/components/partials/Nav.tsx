import { AppShell, Stack, Tooltip, UnstyledButton , useMantineColorScheme } from "@mantine/core";
import {
  IconGauge,
  IconLayoutDashboard,
  IconLogout,
  IconMoonStars,
  IconSettings,
  IconSun,
  IconUser,
  TablerIcon,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";

interface NavbarBtnProps {
  icon: TablerIcon;
  label: string;
  active?: boolean;
  onClick?(): void;
}

function NavbarBtn({ icon: Icon, label, active, onClick }: NavbarBtnProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 150 }}>
      <UnstyledButton
        onClick={onClick}
        className={`
          flex items-center justify-center w-11 h-11 rounded-xl
          transition-all duration-200 ease-out
          ${active
            ? "bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }
        `}
      >
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

interface NavbarLinkProps {
  icon: TablerIcon;
  label: string;
  active?: boolean;
  href?: string;
  closeMobile?: () => void;
}

function NavbarLink({ icon: Icon, label, active, href, closeMobile }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 150 }}>
      <Link
        href={href || ""}
        onClick={closeMobile}
        className={`
          flex items-center justify-center w-11 h-11 rounded-xl
          transition-all duration-200 ease-out no-underline
          ${active
            ? "bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }
        `}
      >
        <Icon size={20} stroke={1.5} />
      </Link>
    </Tooltip>
  );
}

const navLinks = [
  { icon: IconGauge, label: "Overview", href: "/" },
  { icon: IconLayoutDashboard, label: "Process", href: "/process" },
  {
    icon: IconUser,
    label: "User Administration",
    href: "/user",
    onlyIf: (session: Session | null) => {
      if (session?.user) {
        const acl = session?.user.acl;
        return acl?.admin || acl?.owner;
      }
      return false;
    },
  },
  { icon: IconSettings, label: "Settings", href: "/settings" },
];

interface NavProps {
  closeMobile?: () => void;
}

export function Nav({ closeMobile }: NavProps) {
  const { toggleColorScheme, colorScheme } = useMantineColorScheme();
  const { data: session } = useSession();
  const router = useRouter();
  const active = navLinks.findIndex((link) => router.pathname === link.href);

  const links = navLinks
    .filter((link) => (link.onlyIf ? link.onlyIf(session) : true))
    .map((link, index) => (
      <NavbarLink
        {...link}
        key={link.label}
        active={index === active}
        closeMobile={closeMobile}
      />
    ));

  return (
    <AppShell.Navbar p="md" className="glass-sidebar">
      {/* Main Navigation Links */}
      <AppShell.Section grow mt="md">
        <Stack align="center" gap="xs">
          {links}
        </Stack>
      </AppShell.Section>

      {/* Bottom Actions */}
      <AppShell.Section>
        <Stack align="center" gap="xs">
          {/* Theme Toggle */}
          <Tooltip label="Toggle Theme" position="right" transitionProps={{ duration: 150 }}>
            <UnstyledButton
              onClick={() => toggleColorScheme()}
              className="flex items-center justify-center w-11 h-11 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-200"
            >
              {colorScheme === "dark" ? (
                <IconSun size={20} stroke={1.5} />
              ) : (
                <IconMoonStars size={20} stroke={1.5} />
              )}
            </UnstyledButton>
          </Tooltip>

          {/* Logout */}
          <NavbarBtn
            icon={IconLogout}
            label="Logout"
            onClick={() => signOut()}
          />
        </Stack>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
