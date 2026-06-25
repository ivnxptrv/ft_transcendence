import { setRequestLocale } from "next-intl/server";

import ClientDashboard from "./_components/ClientDashboard";
import InsiderDashboard from "./_components/InsiderDashboard";
import { getMatches } from "@/actions/matches";
import { getOrders } from "@/actions/orders";
import { getSession, displayName } from "@/lib/session";

// Uses cookies (session) — can't be statically prerendered.
export const dynamic = "force-dynamic";

// Orders per page. Small enough that a modest order count still shows >1 page.
const PAGE_SIZE = 6;

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);


  const session = await getSession();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  if (session.role === "insider") {
    // Soft nudge only — no redirect. A missing legend just shows the nav dot
    // (and means no matches until it's added).
    const matches = await getMatches(session.id, {
      limit: PAGE_SIZE,
      offset,
      status: sp.status,
    });
    return (
      <InsiderDashboard
        matches={matches}
        profile={session}
        hasLegend={session.hasLegend}
        page={page}
        pageSize={PAGE_SIZE}
        filters={{ status: sp.status }}
      />
    );
  }

  const orders = await getOrders({
    limit: PAGE_SIZE,
    offset,
    status: sp.status,
    dateFrom: sp.date_from,
    dateTo: sp.date_to,
  });
  return (
    <ClientDashboard
      orders={orders}
      userName={displayName(session)}
      page={page}
      pageSize={PAGE_SIZE}
      filters={{ status: sp.status, dateFrom: sp.date_from, dateTo: sp.date_to }}
    />
  );
}
