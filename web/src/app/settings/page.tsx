import { getMockRole } from "@/lib/mock-role";
import { SettingsClient } from "@/app/settings/_components/SettingsClient";

export default async function SettingsPage() {
  // TODO: replace with GET /auth/me — returns { role, email, name }
  const role = await getMockRole();
  const isClient = role === "client";

  return <SettingsClient isClient={isClient} />;
}
