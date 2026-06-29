import { listApiKeys } from "@/actions/auth";
import AppNav from "@/app/[locale]/dashboard/_components/AppNav";
import { AccountSection } from "./_components/AccountSection";
import { ExpertTools } from "./_components/ExpertTools";
import { getSession } from "@/lib/session";
import { getTranslations, setRequestLocale } from "next-intl/server";

// Uses cookies (session) — can't be statically prerendered.
export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  // One loader for the whole page: profile (email/totp/password) + hasLegend.
  // Redirects to /login if unauthenticated.
  const session = await getSession();
  const isClient = session.role === "client";
  // Existing API keys seed the Expert Tools panel. On failure the panel shows an
  // in-place error + retry rather than taking down the page.
  const apiKeys = await listApiKeys();

  return (
    <div
      className={`min-h-screen font-sans ${isClient ? "bg-black text-white" : "bg-[#FAF9F7] text-[#2A2520]"}`}
    >
      <AppNav role={session.role} hasLegend={session.hasLegend} />
      <main className="px-6 pt-12 pb-24 max-w-2xl mx-auto">
        <header className="mb-10">
          <h1
            className={`text-4xl font-bold ${isClient ? "bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent" : "text-zinc-900"}`}
          >
            {t("title")}
          </h1>
        </header>

        <section>
          <AccountSection
            isClient={isClient}
            email={session.email}
            hasPassword={session.has_password}
            enabled={session.totp_enabled}
          />
          <ExpertTools
            isClient={isClient}
            initialKeys={apiKeys.ok ? apiKeys.data : []}
            keysError={apiKeys.ok ? null : apiKeys.error.code}
          />
        </section>
      </main>
    </div>
  );
}
