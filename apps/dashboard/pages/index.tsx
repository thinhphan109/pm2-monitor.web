import { ISetting } from "@pm2.web/typings";
import { InferGetServerSidePropsType } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";

import { SelectedProvider } from "@/components/context/SelectedProvider";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import PublicDashboard from "@/components/dashboard/PublicDashboard";
import { Dashboard } from "@/components/layouts/Dashboard";
import { getServerSideHelpers } from "@/server/helpers";
import { trpc } from "@/utils/trpc";

export default function HomePage({ }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { status } = useSession();
  const dashboardQuery = trpc.server.getDashBoardData.useQuery(undefined, {
    refetchInterval: 5000,
  });

  if (dashboardQuery.status !== "success") {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const data = dashboardQuery.data;

  return (
    <>
      <Head>
        <title>PM2 Monitor - Dashboard</title>
        <meta name="description" content="PM2 Process Monitor Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
      <SelectedProvider servers={data.servers}>
        <Dashboard>
          {status === "authenticated" ? (
            <AdminDashboard settings={data.settings} />
          ) : (
            <PublicDashboard servers={data.servers} settings={data.settings} />
          )}
        </Dashboard>
      </SelectedProvider>
    </>
  );
}

export async function getServerSideProps(ctx: any) {
  const helpers = await getServerSideHelpers();
  await helpers.server.getDashBoardData.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}
