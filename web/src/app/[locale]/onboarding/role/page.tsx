"use client";

import * as React from "react"; // ─── IMPORT FOR REACTNODE TYPE ───
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { setRole } from "@/actions/auth";
import { Link } from "@/i18n/navigation"; // ─── IMPORT LINK ───

// Self-service onboarding only offers the two marketplace roles. `admin` is
// never self-assigned — it's seeded at boot or granted by another admin.
type OnboardingRole = "client" | "insider";

// Post-OAuth role selection. New Google accounts land here (callback + proxy
// gate role-less sessions); the choice is set once, then → /dashboard.
export default function RoleOnboardingPage() {
  const t = useTranslations("onboarding.role");
  const tSignup = useTranslations("auth.signup"); // ─── TRANSLATION SOURCE ───
  const tAuthErrors = useTranslations("auth.errors");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function choose(role: OnboardingRole) {
    setError(null);
    startTransition(async () => {
      const res = await setRole(role);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-[440px] bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-4xl p-12 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            {t("heading")}
          </h1>
          <p className="text-sm text-zinc-500">{t("subtitle")}</p>
        </div>

        <div className="flex flex-col gap-3">
          {(
            [
              { role: "client", titleKey: "client", descKey: "clientDesc" },
              { role: "insider", titleKey: "insider", descKey: "insiderDesc" },
            ] as {
              role: OnboardingRole;
              titleKey: "client" | "insider";
              descKey: "clientDesc" | "insiderDesc";
            }[]
          ).map((o) => (
            <button
              key={o.role}
              type="button"
              onClick={() => choose(o.role)}
              disabled={pending}
              className="w-full text-left p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <span className="block text-sm font-semibold text-white">{t(o.titleKey)}</span>
              <span className="block text-xs text-zinc-500 mt-1">{t(o.descKey)}</span>
            </button>
          ))}
        </div>

        {/* ─── LOCALIZED LEGAL NOTICE DISCLOSURE ─── */}
        <div className="text-[11px] text-zinc-600 text-center leading-relaxed mt-6">
          {tSignup.rich("legalNotice", {
            terms: (chunks: React.ReactNode) => (
              <Link href="/terms" target="_blank" className="text-zinc-400 underline underline-offset-2 hover:text-white transition-colors">
                {chunks}
              </Link>
            ),
            privacy: (chunks: React.ReactNode) => (
              <Link href="/privacy" target="_blank" className="text-zinc-400 underline underline-offset-2 hover:text-white transition-colors">
                {chunks}
              </Link>
            ),
          })}
        </div>

        {error && (
          <p className="text-xs text-red-400 mt-4 text-center">
            {error.startsWith("auth.errors.")
              ? tAuthErrors(error.replace(/^auth\.errors\./, "") as never)
              : error}
          </p>
        )}
      </div>
    </main>
  );
}