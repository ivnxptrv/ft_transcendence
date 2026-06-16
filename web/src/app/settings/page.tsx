import { listApiKeys, type ApiKeyMeta } from "@/actions/auth";
import ClientNav from "@/app/dashboard/_components/ClientNav";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";
import { ExpertTools } from "@/app/settings/_components/ExpertTools";
import { SessionSection } from "@/app/settings/_components/SessionSection";
import { SetPasswordSection } from "@/app/settings/_components/SetPasswordSection";
import { TwoFASection } from "@/app/settings/_components/TwoFASection";
import { getUserProfile } from "@/lib/auth";

type PageProps = {
  searchParams: Promise<{ twofa?: string; twofa_error?: string }>;
};

export default async function SettingsPage({ searchParams }: PageProps) {
  // The profile carries totp_enabled — drives whether we render enrollment or
  // disable UI. getUserProfile() also redirects to /login if unauthenticated.
  const profile = await getUserProfile();
  const isClient = profile.role === "client";
  const Nav = isClient ? ClientNav : InsiderNav;
  // Existing API keys (metadata only) seed the Expert Tools panel. Best-effort:
  // a failure here shouldn't take down the whole settings page.
  const apiKeys: ApiKeyMeta[] = await listApiKeys().catch(() => []);
  const { twofa, twofa_error } = await searchParams;
  const flash = twofa_error ? "error" : twofa === "disabled" ? "disabled" : null;

  return (
    <div
      className={`min-h-screen font-sans ${isClient ? "bg-black text-white" : "bg-[#FAF9F7] text-[#2A2520]"}`}
    >
      <Nav />
      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-10">
          <h1
            className={`text-4xl font-bold ${isClient ? "bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent" : "text-zinc-900"}`}
          >
            Settings
          </h1>
        </header>

        <section>
          <TwoFASection
            isClient={isClient}
            enabled={profile.totp_enabled}
            flash={flash}
          />
          {!profile.has_password && <SetPasswordSection isClient={isClient} />}
          <ExpertTools isClient={isClient} initialKeys={apiKeys} />
          <SessionSection isClient={isClient} />
        </section>
      </main>
    </div>
  );
}
