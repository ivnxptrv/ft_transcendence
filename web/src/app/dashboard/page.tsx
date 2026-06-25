import ClientDashboard from "./_components/ClientDashboard";
import InsiderDashboard from "./_components/InsiderDashboard";
import { getMatches } from "@/actions/matches";
import { getOrders } from "@/actions/orders";
import { getSession, displayName } from "@/lib/session";

// Orders per page. Small enough that a modest order count still shows >1 page.
const PAGE_SIZE = 6;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  if (session.role === "insider") {
    // Soft nudge only — no redirect. A missing legend just shows the nav dot
    // (and means no matches until it's added).
    const matches = await getMatches(session.id, {
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    });
    return (
      <InsiderDashboard
        matches={matches}
        profile={session}
        hasLegend={session.hasLegend}
        page={page}
        pageSize={PAGE_SIZE}
      />
    );
  }

  const orders = await getOrders({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  return (
    <ClientDashboard
      orders={orders}
      userName={displayName(session)}
      page={page}
      pageSize={PAGE_SIZE}
    />
  );
}
