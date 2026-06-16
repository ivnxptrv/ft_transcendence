import { redirect } from "next/navigation";

import { getOrders, getMatches } from "@/lib/mock-data";
import ClientDashboard from "./_components/ClientDashboard";
import InsiderDashboard from "./_components/InsiderDashboard";
import { getCurrentUser } from "@/lib/auth";
import { getLegend } from "@/actions/legend";

export default async function DashboardPage() {
  const { userId, role } = await getCurrentUser();
  if (role === "insider") {
    // No legend yet → send them to add one (they don't appear in matches
    // without it). getLegend reads the real record, so once saved this stops
    // firing — no redirect loop.
    const legend = await getLegend(userId);
    if (!legend) redirect("/legend");

    const matches = await getMatches(userId);
    return <InsiderDashboard matches={matches} hasLegend />;
  }

  const orders = await getOrders();
  return <ClientDashboard orders={orders} />;
}
