import { RouteSpinner } from "@/app/_components/RouteSpinner";
import { getCurrentUser } from "@/lib/auth";

// Shared route (client Orders / insider Matches): tone follows the role so the
// fallback matches the page theme. Role is read from the access cookie — no
// network read, so the spinner stays instant.
export default async function Loading() {
  const { role } = await getCurrentUser();
  return <RouteSpinner tone={role === "client" ? "dark" : "light"} />;
}
