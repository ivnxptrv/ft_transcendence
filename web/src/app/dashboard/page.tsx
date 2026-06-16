import { getOrders, getMatches } from "@/lib/mock-data";
import ClientDashboard from "./_components/ClientDashboard";
import InsiderDashboard from "./_components/InsiderDashboard";
import { getSession, displayName } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();
  const name = displayName(session);
  if (session.role === "insider") {
    // Soft nudge only — no redirect. A missing legend just shows the nav dot
    // (and means no matches until it's added).
    const matches = await getMatches(session.id);
    return <InsiderDashboard matches={matches} hasLegend={session.hasLegend} name={name} />;
  }

  const orders = await getOrders();
  return <ClientDashboard orders={orders} name={name} />;
}
