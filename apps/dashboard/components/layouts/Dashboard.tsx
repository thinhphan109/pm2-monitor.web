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
          width: { base: 240, lg: 72 },
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
            backgroundColor: "rgba(15, 23, 42, 0.98)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRight: "1px solid rgba(51, 65, 85, 0.5)",
            zIndex: 200,
            top: "var(--app-shell-header-height, 56px)",
            height: "calc(100vh - var(--app-shell-header-height, 56px))",
          },
          header: {
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(51, 65, 85, 0.5)",
            zIndex: 201,
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
