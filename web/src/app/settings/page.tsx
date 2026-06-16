import { listApiKeys, type ApiKeyMeta } from "@/actions/auth";
import AppNav from "@/app/dashboard/_components/AppNav";
import { AccountSection } from "@/app/settings/_components/AccountSection";
import { ExpertTools } from "@/app/settings/_components/ExpertTools";
import { getUserProfile } from "@/lib/auth";
import { getSession } from "@/lib/session";

type PageProps = {
  searchParams: Promise<{ twofa?: string; twofa_error?: string }>;
};

export default async function SettingsPage({ searchParams }: PageProps) {
  // The profile carries totp_enabled — drives whether we render enrollment or
  // disable UI. getUserProfile() also redirects to /login if unauthenticated.
  const profile = await getUserProfile();
  const { hasLegend } = await getSession();
  const isClient = profile.role === "client";
  // Existing API keys (metadata only) seed the Expert Tools panel. Best-effort:
  // a failure here shouldn't take down the whole settings page.
  const apiKeys: ApiKeyMeta[] = await listApiKeys().catch(() => []);
  const { twofa, twofa_error } = await searchParams;
  const flash = twofa_error ? "error" : twofa === "disabled" ? "disabled" : null;

  return (
    <div
      className={`min-h-screen font-sans ${isClient ? "bg-black text-white" : "bg-[#FAF9F7] text-[#2A2520]"}`}
    >
      <AppNav role={profile.role} hasLegend={hasLegend} />
      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-10">
          <h1
            className={`text-4xl font-bold ${isClient ? "bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent" : "text-zinc-900"}`}
          >
            Settings
          </h1>
        </header>

        <section>
          <AccountSection
            isClient={isClient}
            email={profile.email}
            hasPassword={profile.has_password}
            enabled={profile.totp_enabled}
            flash={flash}
          />
          <ExpertTools isClient={isClient} initialKeys={apiKeys} />
        </section>
      </main>
    </div>
  );
}
