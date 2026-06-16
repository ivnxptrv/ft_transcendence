// import { getOrders, getMatches, getInsiderProfile } from "@/lib/mock-data";
import ClientDashboard from "./_components/ClientDashboard";
import InsiderDashboard from "./_components/InsiderDashboard";
import { getCurrentUser, getUserProfile } from "@/lib/auth";
import { getMatches } from "@/actions/matches";
import { getOrders } from "@/actions/orders";

export default async function DashboardPage() {
  const { userId, role } = await getCurrentUser();
  if (role === "insider") {
    const [matches, profile] = await Promise.all([getMatches(userId), getUserProfile()]);
    return <InsiderDashboard matches={matches} profile={profile!} />;
  }

  const [orders, profile] = await Promise.all([getOrders(), getUserProfile()]);
  return <ClientDashboard orders={orders} userName={profile?.first_name ?? "User"} />;
}
