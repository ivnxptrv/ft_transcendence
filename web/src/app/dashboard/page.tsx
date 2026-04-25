import { getOrders, getMatches, getInsiderProfile } from "@/lib/mock-data";
import ClientDashboard from "./_components/ClientDashboard";
import InsiderDashboard from "./_components/InsiderDashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const { userId, role } = await getCurrentUser();
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
