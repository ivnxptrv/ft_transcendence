import { RouteSpinner } from "@/app/_components/RouteSpinner";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, setRequestLocale } from "next-intl/server";

// Shared route: tone follows the role so the fallback matches the page theme.
// Role is read from the access cookie — no network read, spinner stays instant.
// Loading files don't receive `params`, so the locale is read via getLocale().
export default async function Loading() {
  setRequestLocale(await getLocale());
  const { role } = await getCurrentUser();
  return <RouteSpinner tone={role === "client" ? "dark" : "light"} />;
}
