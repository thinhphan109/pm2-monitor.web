import { AppShell, Transition } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { ReactNode } from "react";

import { Head } from "../partials/Head";
import { Nav } from "../partials/Nav";

export function Dashboard({ children }: { children: ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="min-h-screen bg-bg-primary">
      <AppShell
        header={{ height: { base: 56, md: 64 } }}
        navbar={{
          width: { base: 280, lg: 72 },
          breakpoint: "lg",
          collapsed: { mobile: !mobileOpened },
        }}
        padding="md"
        styles={{
          root: {
            backgroundColor: "var(--bg-primary)",
          },
          main: {
            backgroundColor: "var(--bg-primary)",
            minHeight: "calc(100vh - var(--app-shell-header-height, 0px))",
          },
          navbar: {
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRight: "1px solid rgba(51, 65, 85, 0.5)",
          },
          header: {
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(51, 65, 85, 0.5)",
          },
        }}
      >
        <Head mobileOpened={mobileOpened} toggleMobile={toggleMobile} />
        <Nav closeMobile={closeMobile} />

        <AppShell.Main className="custom-scrollbar">
          {children}
        </AppShell.Main>
      </AppShell>

      {/* Mobile Overlay Backdrop */}
      <Transition mounted={mobileOpened && !isDesktop} transition="fade" duration={200}>
        {(styles) => (
          <div
            style={styles}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[199] lg:hidden"
            onClick={closeMobile}
          />
        )}
      </Transition>
    </div>
  );
}
