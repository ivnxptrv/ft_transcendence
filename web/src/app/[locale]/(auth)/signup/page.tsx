"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { signup, type SignupState } from "@/actions/auth";
import { FieldInput, PrimaryButton, SecondaryButton } from "../_components/auth";
import { Link } from "@/i18n/navigation";
import type { Role } from "@/lib/types";

export default function SignupPage() {
  const t = useTranslations("auth.signup");
  const tAuthErrors = useTranslations("auth.errors");
  const [role, setRole] = useState<Role>("client");
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useActionState<SignupState, FormData>(signup, {});

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 text-white selection:bg-white selection:text-black font-sans relative overflow-hidden">
      {/* Dynamic Background Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Decorative Blur Spheres */}
      <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-white/2 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-white/1 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[440px] bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-4xl p-12 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] relative z-10 animate-in fade-in duration-1000">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            {t("heading")}
          </h1>
          <p className="text-sm text-zinc-500">{t("subtitle")}</p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <FieldInput name="firstName" placeholder={t("firstName")} required />
            <FieldInput name="lastName" placeholder={t("lastName")} required />
          </div>

          <FieldInput name="email" type="email" placeholder={t("emailPlaceholder")} required />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              autoComplete="new-password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-all font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <div className="mt-2">
            <p className="text-[11px] text-zinc-500 mb-3 uppercase tracking-widest font-bold">
              {t("rolePrompt")}
            </p>
            {/* Hidden input to capture role in FormData */}
            <input type="hidden" name="role" value={role} />

            <div className="grid grid-cols-2 gap-3">
              {(["client", "insider"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all cursor-pointer ${
                    role === r
                      ? "bg-white/5 border-white text-white"
                      : "bg-transparent border-white/10 text-zinc-500 hover:border-white/20"
                  }`}
                >
                  <span className="text-sm font-bold uppercase tracking-wide">
                    {r === "client" ? t("client") : t("insider")}
                  </span>
                  <span className="text-[10px] opacity-60 mt-1.5 uppercase tracking-tighter">
                    {r === "client" ? t("clientDesc") : t("insiderDesc")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            {state.error && (
              <p className="text-sm text-red-400 text-center mb-4">
                {state.error.startsWith("auth.errors.")
                  ? tAuthErrors(state.error.replace(/^auth\.errors\./, "") as never)
                  : state.error}
              </p>
            )}
            <PrimaryButton type="submit">{t("submit")}</PrimaryButton>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-zinc-600">
                <span className="bg-transparent px-2">{t("orContinueWith")}</span>
              </div>
            </div>

            <SecondaryButton
              onClick={() => {
                window.location.href = "/api/auth/google/login";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-80">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53"
                />
              </svg>
              {t("continueWithGoogle")}
            </SecondaryButton>

            <p className="text-center text-xs text-zinc-500 mt-6">
              {t("haveAccount")}{" "}
              <Link href="/login" className="text-white hover:underline transition-all">
                {t("signIn")}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
