import { getOrders, getMatches } from "@/lib/mock-data";
import ClientDashboard from "./_components/ClientDashboard";
import InsiderDashboard from "./_components/InsiderDashboard";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const { userId, role, hasLegend } = await getSession();
  if (role === "insider") {
    // Soft nudge only — no redirect. A missing legend just shows the nav dot
    // (and means no matches until it's added).
    const matches = await getMatches(userId);
    return <InsiderDashboard matches={matches} hasLegend={hasLegend} />;
  }

  const orders = await getOrders();
  return <ClientDashboard orders={orders} />;
}
