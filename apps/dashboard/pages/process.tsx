import { Button, Flex } from "@mantine/core";
import { ISetting } from "@pm2.web/typings";
import { IconLayoutDashboard, IconLock } from "@tabler/icons-react";
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
            Quản lý Process
          </h1>
          <p className="text-sm text-slate-400">
            Theo dõi và điều khiển các PM2 process của bạn
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
            Chưa chọn process nào
          </h3>
          <p className="text-sm text-slate-500">
            Chọn server và process từ thanh công cụ phía trên để theo dõi
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
  const [isCheckingPin, setIsCheckingPin] = useState(true);

  const { data: hasPin, isLoading: isPinLoading } = trpc.setting.hasProcessPin.useQuery();

  const dashboardQuery = trpc.server.getDashBoardData.useQuery(undefined, {
    refetchInterval: (query) => {
      const data = query.state.data;
      const polling = data?.settings?.polling?.frontend || 0;
      return Math.min(Math.max(polling, 4000), 10_000);
    },
  });

  // Check session storage for PIN access
  useEffect(() => {
    if (isPinLoading) return;

    if (status === "authenticated") {
      setPinVerified(true);
      setIsCheckingPin(false);
      return;
    }

    // Check session storage for PIN access
    const stored = sessionStorage.getItem("processPinAccess");
    if (stored) {
      try {
        const { expiry } = JSON.parse(stored);
        if (Date.now() < expiry) {
          setPinVerified(true);
          setIsCheckingPin(false);
          return;
        } else {
          sessionStorage.removeItem("processPinAccess");
        }
      } catch {
        sessionStorage.removeItem("processPinAccess");
      }
    }

    // Not verified - needs protection
    setIsCheckingPin(false);
  }, [status, hasPin, isPinLoading]);

  const handlePinSuccess = () => {
    setPinVerified(true);
    setShowPinModal(false);
  };

  // Show protection if not authenticated and not PIN verified
  const needsProtection = !pinVerified && status !== "authenticated" && !isCheckingPin;
  const hasPinConfigured = hasPin === true;

  if (dashboardQuery.status !== "success" || isCheckingPin || isPinLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  const data = dashboardQuery.data;

  return (
    <>
      <Head>
        <title>PM2 Monitor - Process</title>
        <meta name="description" content="PM2 Process Management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
      <SelectedProvider servers={data.servers}>
        <Dashboard>
          <div className="relative">
            <Process settings={data.settings} />

            {/* Locked Overlay */}
            {needsProtection && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
                <div className="flex flex-col items-center gap-4 text-center px-6">
                  <div className="p-4 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                    <IconLock size={32} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Yêu cầu xác thực
                    </h3>
                    <p className="text-sm text-slate-400">
                      Nhập mã PIN để xem thông tin Process
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowPinModal(true)}
                    leftSection={<IconLock size={16} />}
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
                    size="md"
                    radius="lg"
                  >
                    Nhập mã PIN
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Dashboard>
      </SelectedProvider>

      {/* PIN Modal */}
      <PinModal opened={showPinModal} onSuccess={handlePinSuccess} />
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
