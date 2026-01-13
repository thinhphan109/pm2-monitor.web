import { Accordion, Badge, Grid, Overlay, ScrollArea } from "@mantine/core";
import { IconLock, IconSettings, IconUser } from "@tabler/icons-react";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";

import { Dashboard } from "@/components/layouts/Dashboard";
import DatabaseAction from "@/components/settings/DatabaseAction";
import DeleteAccount from "@/components/settings/DeleteAccount";
import UnlinkOAuth2 from "@/components/settings/UnlinkOAuth2";
import UpdateConfiguration from "@/components/settings/UpdateConfiguration";
import UpdatePassword from "@/components/settings/UpdatePassword";
import { getServerSideHelpers } from "@/server/helpers";
import { trpc } from "@/utils/trpc";

export default function Settings({ }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  const getSettingsQuery = trpc.setting.getSettings.useQuery();
  const settings = getSettingsQuery.data!;
  const hasPermission = session?.user?.acl?.owner || session?.user?.acl?.admin;
  const isOAuth2 = !!session?.user?.oauth2?.provider;

  if (getSettingsQuery.status !== "success") {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>PM2 Monitor - Settings</title>
        <meta name="description" content="PM2 Monitor Settings" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>

      <Dashboard>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <IconSettings size={20} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">
                Settings
              </h1>
              <p className="text-sm text-slate-400">
                Configure your PM2 Monitor dashboard
              </p>
            </div>
          </div>

          {/* Settings Grid */}
          <Grid gutter="md">
            {/* Configuration Panel */}
            <Grid.Col span={{ base: 12, md: 7, lg: 8 }}>
              <div className="glass-card p-6 h-full relative">
                <div className="flex items-center gap-2 mb-6">
                  <IconSettings size={18} className="text-slate-400" />
                  <h2 className="text-lg font-medium text-white">Configuration</h2>
                </div>

                <ScrollArea className="custom-scrollbar">
                  <Accordion
                    variant="separated"
                    radius="lg"
                    classNames={{
                      item: "bg-slate-800/50 border border-slate-700/50",
                      control: "text-slate-200 hover:bg-slate-700/30",
                      label: "text-sm font-medium",
                      panel: "text-slate-300",
                      chevron: "text-slate-400",
                    }}
                  >
                    <UpdateConfiguration settings={settings} />
                    <DatabaseAction />
                  </Accordion>
                </ScrollArea>

                {/* Permission Overlay */}
                {!hasPermission && (
                  <Overlay
                    color="#020617"
                    backgroundOpacity={0.8}
                    radius="lg"
                    blur={8}
                    center
                    zIndex={2}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-rose-500/20">
                        <IconLock size={24} className="text-rose-400" />
                      </div>
                      <Badge
                        size="lg"
                        variant="outline"
                        color="red"
                        className="border-rose-500/50 text-rose-400"
                      >
                        Owner/Admin Permission Required
                      </Badge>
                    </div>
                  </Overlay>
                )}
              </div>
            </Grid.Col>

            {/* User Settings Panel */}
            <Grid.Col span={{ base: 12, md: 5, lg: 4 }}>
              <div className="glass-card p-6 h-full">
                <div className="flex items-center gap-2 mb-6">
                  <IconUser size={18} className="text-slate-400" />
                  <h2 className="text-lg font-medium text-white">User Settings</h2>
                </div>

                <Accordion
                  variant="separated"
                  radius="lg"
                  classNames={{
                    item: "bg-slate-800/50 border border-slate-700/50",
                    control: "text-slate-200 hover:bg-slate-700/30",
                    label: "text-sm font-medium",
                    panel: "text-slate-300",
                    chevron: "text-slate-400",
                  }}
                >
                  <UpdatePassword />
                  <DeleteAccount />
                  {isOAuth2 && <UnlinkOAuth2 />}
                </Accordion>
              </div>
            </Grid.Col>
          </Grid>
        </div>
      </Dashboard>
    </>
  );
}

export async function getServerSideProps() {
  const helpers = await getServerSideHelpers();

  await helpers.setting.getSettings.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}
