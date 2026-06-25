import { setRequestLocale } from "next-intl/server";

import ClientDashboard from "./_components/ClientDashboard";
import InsiderDashboard from "./_components/InsiderDashboard";
import { getMatches } from "@/actions/matches";
import { getOrders } from "@/actions/orders";
import { getSession, displayName } from "@/lib/session";

// Uses cookies (session) — can't be statically prerendered.
export const dynamic = "force-dynamic";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (session.role === "insider") {
    // Soft nudge only — no redirect. A missing legend just shows the nav dot
    // (and means no matches until it's added).
    const matches = await getMatches(session.id);
    return <InsiderDashboard matches={matches} profile={session} hasLegend={session.hasLegend} />;
  }

  const orders = await getOrders();
  return <ClientDashboard orders={orders} userName={displayName(session)} />;
}
