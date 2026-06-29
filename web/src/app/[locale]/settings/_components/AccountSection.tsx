"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";

import { logout, setPassword, type SetPasswordState } from "@/actions/auth";
import { TwoFARow } from "./TwoFASection";

// Single bottom "Account management" card: email (copy), 2FA, an optional
// set-password form (OAuth accounts only), and sign out.
export function AccountSection({
  isClient,
  email,
  hasPassword,
  enabled,
}: {
  isClient: boolean;
  email: string;
  hasPassword: boolean;
  enabled: boolean;
}) {
  const t = useTranslations("settings");

  return (
    <>
      <p
        className={`text-[10px] uppercase tracking-widest font-bold mb-3 px-1 ${isClient ? "text-zinc-600" : "text-zinc-400"}`}
      >
        {t("accountManagement")}
      </p>
      <div
        className={`rounded-3xl border overflow-hidden mb-8 ${isClient ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-200/60 shadow-sm"}`}
      >
        <EmailRow isClient={isClient} email={email} />
        {/* 2FA needs a password (disabling it requires one), and OAuth-only
            logins rely on Google's MFA — so 2FA is hidden until a password is
            set. Set-password and 2FA are mutually exclusive here. */}
        {hasPassword ? (
          <TwoFARow isClient={isClient} enabled={enabled} />
        ) : (
          <SetPasswordRow isClient={isClient} />
        )}
        <LogoutRow isClient={isClient} />
      </div>
    </>
  );
}

const DIVIDER = (isClient: boolean) =>
  isClient ? "border-t border-white/5" : "border-t border-zinc-200/60";

function EmailRow({ isClient, email }: { isClient: boolean; email: string }) {
  const t = useTranslations("settings");
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="p-5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className={`text-[13px] font-semibold ${isClient ? "text-zinc-200" : "text-zinc-900"}`}>
          {t("email")}
        </p>
        <p className={`text-xs truncate ${isClient ? "text-zinc-400" : "text-zinc-600"}`}>
          {email}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        className={`shrink-0 text-xs font-medium underline underline-offset-4 cursor-pointer transition-colors ${isClient ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"}`}
      >
        {copied ? t("copied") : t("copy")}
      </button>
    </div>
  );
}

// Collapsed to a single row; expands into the form on click (mirrors the 2FA
// set-up affordance).
function SetPasswordRow({ isClient }: { isClient: boolean }) {
  const t = useTranslations("settings");
  const tAuthErrors = useTranslations("auth.errors");
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<SetPasswordState, FormData>(setPassword, {});

  if (state.success) {
    return (
      <p
        className={`p-5 text-[13px] font-semibold ${DIVIDER(isClient)} ${isClient ? "text-emerald-400" : "text-emerald-600"}`}
      >
        {t("setPassword.success")}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full text-left p-5 flex items-center justify-between transition-colors cursor-pointer group ${DIVIDER(isClient)} ${isClient ? "hover:bg-white/2" : "hover:bg-zinc-50"}`}
      >
        <span
          className={`text-[13px] font-semibold ${isClient ? "text-zinc-200" : "text-zinc-900"}`}
        >
          {t("setPassword.label")}
        </span>
        <span
          className={`text-xs font-medium transition-colors ${isClient ? "text-zinc-600 group-hover:text-zinc-400" : "text-zinc-400 group-hover:text-zinc-600"}`}
        >
          {t("setPassword.setUp")}
        </span>
      </button>
    );
  }

  return (
    <form action={formAction} className={`p-5 flex flex-col gap-3 ${DIVIDER(isClient)}`}>
      <p className={`text-[13px] font-semibold ${isClient ? "text-zinc-200" : "text-zinc-900"}`}>
        {t("setPassword.label")}
      </p>
      <p className={`text-xs ${isClient ? "text-zinc-400" : "text-zinc-600"}`}>
        {t("setPassword.description")}
      </p>
      <input
        name="password"
        type="password"
        placeholder={t("setPassword.placeholder")}
        autoComplete="new-password"
        required
        className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all font-sans ${isClient ? "bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20" : "bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400"}`}
      />
      {state.error && (
        <p className="text-xs text-red-400">
          {state.error.startsWith("auth.errors.")
            ? tAuthErrors(state.error.replace(/^auth\.errors\./, "") as never)
            : state.error}
        </p>
      )}
      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={`flex-1 rounded-full py-3 text-sm font-medium transition-all cursor-pointer ${isClient ? "bg-transparent text-zinc-400 border border-white/10 hover:bg-white/5" : "bg-transparent text-zinc-600 border border-zinc-200 hover:bg-zinc-50"}`}
        >
          {t("setPassword.cancel")}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-full py-3 text-sm font-semibold bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {pending ? t("setPassword.saving") : t("setPassword.submit")}
        </button>
      </div>
    </form>
  );
}

function LogoutRow({ isClient }: { isClient: boolean }) {
  const t = useTranslations("settings");
  return (
    <form action={logout} className={DIVIDER(isClient)}>
      <button
        type="submit"
        className={`w-full text-left p-5 flex items-center transition-colors cursor-pointer group ${isClient ? "hover:bg-white/2" : "hover:bg-zinc-50"}`}
      >
        <span className="text-[13px] font-semibold text-red-500">{t("signOut")}</span>
      </button>
    </form>
  );
}
