import { Flex } from "@mantine/core";
import { ISetting } from "@pm2.web/typings";
import { IconLayoutDashboard } from "@tabler/icons-react";
import { InferGetServerSidePropsType } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";

import { SelectedProvider, useSelected } from "@/components/context/SelectedProvider";
import { Dashboard } from "@/components/layouts/Dashboard";
import ProcessItem from "@/components/process/ProcessItem";
import PinModal from "@/components/process/PinModal";
import { getServerSideHelpers } from "@/server/helpers";
import { trpc } from "@/utils/trpc";

function Process({ settings }: { settings: ISetting }) {
  const { selectedProcesses } = useSelected();

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-500/20">
          <IconLayoutDashboard size={20} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Process Management
          </h1>
          <p className="text-sm text-slate-400">
            Monitor and control your PM2 processes
          </p>
        </div>
      </div>

      {/* Process List */}
      {selectedProcesses?.length ? (
        <Flex gap="md" direction="column">
          {selectedProcesses.map((process) => (
            <ProcessItem
              process={process}
              key={process._id}
              setting={settings}
            />
          ))}
        </Flex>
      ) : (
        <div className="glass-card p-12 text-center">
          <IconLayoutDashboard size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            No processes selected
          </h3>
          <p className="text-sm text-slate-500">
            Select servers and processes from the header to manage them
          </p>
        </div>
      )}
    </div>
  );
}

export default function ProcessPage({ }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { status } = useSession();
  const [pinVerified, setPinVerified] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const { data: hasPin } = trpc.setting.hasProcessPin.useQuery();

  const dashboardQuery = trpc.server.getDashBoardData.useQuery(undefined, {
    refetchInterval: (query) => {
      const data = query.state.data;
      const polling = data?.settings?.polling?.frontend || 0;
      return Math.min(Math.max(polling, 4000), 10_000);
    },
  });

  // Check session storage for PIN access
  useEffect(() => {
    if (status === "authenticated") {
      setPinVerified(true);
      return;
    }

    const stored = sessionStorage.getItem("processPinAccess");
    if (stored) {
      try {
        const { expiry } = JSON.parse(stored);
        if (Date.now() < expiry) {
          setPinVerified(true);
          return;
        } else {
          sessionStorage.removeItem("processPinAccess");
        }
      } catch {
        sessionStorage.removeItem("processPinAccess");
      }
    }

    // Show PIN modal if PIN is configured and user is not authenticated
    if (hasPin && status === "unauthenticated") {
      setShowPinModal(true);
    } else if (hasPin === false) {
      // No PIN configured, allow access
      setPinVerified(true);
    }
  }, [status, hasPin]);

  const handlePinSuccess = () => {
    setPinVerified(true);
    setShowPinModal(false);
  };

  if (dashboardQuery.status !== "success") {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Loading processes...</span>
        </div>
      </div>
    );
  }

  const data = dashboardQuery.data;

  // Show PIN modal if not verified
  if (!pinVerified && hasPin) {
    return (
      <>
        <Head>
          <title>PM2 Monitor - Processes</title>
          <meta name="description" content="PM2 Process Management" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" type="image/png" href="/logo.png" />
        </Head>
        <div className="min-h-screen bg-bg-primary">
          <PinModal opened={showPinModal} onSuccess={handlePinSuccess} />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>PM2 Monitor - Processes</title>
        <meta name="description" content="PM2 Process Management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
      <SelectedProvider servers={data.servers}>
        <Dashboard>
          <Process settings={data.settings} />
        </Dashboard>
      </SelectedProvider>
    </>
  );
}

export async function getServerSideProps() {
  const helpers = await getServerSideHelpers();

  await helpers.server.getDashBoardData.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}
