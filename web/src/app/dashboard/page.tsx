// import { getSession } from "@/lib/auth";
import { getOrders, getMatches, getInsiderProfile } from "@/lib/mock-data";
import ClientDashboard from "./_components/ClientDashboard";
import InsiderDashboard from "./_components/InsiderDashboard";
// import { getMatches } from "@/actions/matches";
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const userId = "user_001";
  if (role === "insider") {
    const [matches, profile] = await Promise.all([
      getMatches(userId),
      getInsiderProfile("insider_001"),
    ]);
    return <InsiderDashboard matches={matches} profile={profile!} />;
  }

  const orders = await getOrders();
  return <ClientDashboard orders={orders} />;
}
