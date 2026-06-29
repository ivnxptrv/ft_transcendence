"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { disable2FA, enroll2FA, verify2FA } from "@/actions/auth";
import { messageFor } from "@/lib/errors";

type EnrollData = {
  secret: string;
  otpauth_uri: string;
  qr_svg: string;
};

type Step =
  | { kind: "idle" }
  | { kind: "enrolling"; data: EnrollData; error: string | null }
  | { kind: "done"; codes: string[] };

function ToggleRow({
  label,
  rightLabel,
  rightTone = "muted",
  isClient,
  onClick,
}: {
  label: string;
  rightLabel: string;
  rightTone?: "muted" | "ok" | "danger";
  isClient: boolean;
  onClick: () => void;
}) {
  const toneColor =
    rightTone === "ok"
      ? "text-emerald-400"
      : rightTone === "danger"
        ? "text-red-500"
        : isClient
          ? "text-zinc-600 group-hover:text-zinc-400"
          : "text-zinc-400 group-hover:text-zinc-600";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-5 flex items-center justify-between transition-colors cursor-pointer group ${isClient ? "hover:bg-white/2" : "hover:bg-zinc-50"}`}
    >
      <span className={`text-[13px] font-semibold ${isClient ? "text-zinc-200" : "text-zinc-900"}`}>
        {label}
      </span>
      <span className={`text-xs font-medium transition-colors ${toneColor}`}>{rightLabel}</span>
    </button>
  );
}

function EnableFlow({ isClient, onDone }: { isClient: boolean; onDone: () => void }) {
  const t = useTranslations("settings.twoFactor");
  const tErrors = useTranslations("errors");
  const [step, setStep] = useState<Step>({ kind: "idle" });
  const [code, setCode] = useState("");
  const [startError, setStartError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleStart() {
    setStartError(null);
    startTransition(async () => {
      const res = await enroll2FA();
      if (res.ok) setStep({ kind: "enrolling", data: res.data, error: null });
      else setStartError(tErrors(messageFor("identity.2fa", res.error.code)));
    });
  }

  function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step.kind !== "enrolling") return;
    const enrolling = step;
    startTransition(async () => {
      const res = await verify2FA({ secret: enrolling.data.secret, code });
      if (res.ok) {
        setStep({ kind: "done", codes: res.data.recovery_codes });
        setCode("");
      } else {
        setStep({ ...enrolling, error: tErrors(messageFor("identity.2fa", res.error.code)) });
      }
    });
  }

  if (step.kind === "idle") {
    return (
      <>
        <ToggleRow
          label={t("enable")}
          rightLabel={pending ? t("loading") : t("setUp")}
          isClient={isClient}
          onClick={handleStart}
        />
        {startError && <p className="px-5 pb-4 text-xs text-red-400">{startError}</p>}
      </>
    );
  }

  if (step.kind === "enrolling") {
    return (
      <div className="p-5 flex flex-col gap-5">
        <p className={`text-[13px] font-semibold ${isClient ? "text-zinc-200" : "text-zinc-900"}`}>
          {t("scan")}
        </p>
        <div className="flex justify-center">
          {/* SVG is rendered server-side (qrcode.toString); safe to inject. */}
          <div
            className={`p-4 rounded-2xl ${isClient ? "bg-white/5 border border-white/10" : "bg-zinc-100 border border-zinc-200"}`}
            style={{ width: 220, height: 220 }}
            dangerouslySetInnerHTML={{ __html: step.data.qr_svg }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p
            className={`text-[10px] uppercase tracking-widest font-bold ${isClient ? "text-zinc-600" : "text-zinc-500"}`}
          >
            {t("cantScan")}
          </p>
          <code
            className={`block font-mono text-xs break-all p-3 rounded-xl ${isClient ? "bg-white/5 text-zinc-300" : "bg-zinc-100 text-zinc-700"}`}
          >
            {step.data.secret}
          </code>
        </div>
        <form onSubmit={handleVerify} className="flex flex-col gap-3 mt-1">
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={t("codePlaceholder")}
            aria-label={t("codePlaceholder")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all font-sans ${isClient ? "bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20" : "bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400"}`}
          />
          {step.error && <p className="text-xs text-red-400">{step.error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep({ kind: "idle" })}
              disabled={pending}
              className={`flex-1 rounded-full py-3 text-sm font-medium transition-all cursor-pointer ${isClient ? "bg-transparent text-zinc-400 border border-white/10 hover:bg-white/5" : "bg-transparent text-zinc-600 border border-zinc-200 hover:bg-zinc-50"}`}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-full py-3 text-sm font-semibold bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {pending ? t("verifying") : t("verifyEnable")}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // step.kind === "done"
  return (
    <div className="p-5 flex flex-col gap-4">
      <p
        className={`text-[13px] font-semibold ${isClient ? "text-emerald-400" : "text-emerald-600"}`}
      >
        {t("success")}
      </p>
      <p className={`text-xs ${isClient ? "text-zinc-400" : "text-zinc-600"}`}>
        {t("recoveryDescription")}
      </p>
      <div
        className={`grid grid-cols-2 gap-2 p-3 rounded-xl font-mono text-xs ${isClient ? "bg-white/5 text-zinc-200" : "bg-zinc-100 text-zinc-800"}`}
      >
        {step.codes.map((c) => (
          <code key={c}>{c}</code>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(step.codes.join("\n"));
        }}
        className={`text-xs underline underline-offset-4 self-start cursor-pointer ${isClient ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"}`}
      >
        {t("copyAll")}
      </button>
      <button
        type="button"
        onClick={onDone}
        className="rounded-full py-3 text-sm font-semibold bg-white text-black hover:bg-zinc-200 cursor-pointer transition-all"
      >
        {t("done")}
      </button>
    </div>
  );
}

function DisableForm({ isClient }: { isClient: boolean }) {
  const t = useTranslations("settings.twoFactor");
  const tErrors = useTranslations("errors");
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!open) {
    return (
      <ToggleRow
        label={t("label")}
        rightLabel={t("enabled")}
        rightTone="ok"
        isClient={isClient}
        onClick={() => setOpen(true)}
      />
    );
  }

  function handleDisable(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await disable2FA({ password, code });
      if (res.ok) {
        // Re-fetch server truth: totp_enabled flips to false → EnableFlow shows.
        router.refresh();
      } else {
        setError(tErrors(messageFor("identity.2fa", res.error.code)));
      }
    });
  }

  return (
    <form onSubmit={handleDisable} className="p-5 flex flex-col gap-3">
      <p className={`text-[13px] font-semibold ${isClient ? "text-zinc-200" : "text-zinc-900"}`}>
        {t("disable")}
      </p>
      <input
        id="password"
        name="password"
        type="password"
        placeholder={t("currentPassword")}
        aria-label={t("currentPassword")}
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all font-sans ${isClient ? "bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20" : "bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400"}`}
      />
      <input
        id="code"
        name="code"
        type="text"
        autoComplete="one-time-code"
        placeholder={t("codeOrRecoveryPlaceholder")}
        aria-label={t("codeOrRecoveryPlaceholder")}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all font-sans ${isClient ? "bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20" : "bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400"}`}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className={`flex-1 rounded-full py-3 text-sm font-medium transition-all cursor-pointer disabled:opacity-50 ${isClient ? "bg-transparent text-zinc-400 border border-white/10 hover:bg-white/5" : "bg-transparent text-zinc-600 border border-zinc-200 hover:bg-zinc-50"}`}
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-full py-3 text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          {pending ? t("disabling") : t("disableBtn")}
        </button>
      </div>
    </form>
  );
}

// Embeddable row for the Account card (no own heading/card wrapper).
export function TwoFARow({ isClient, enabled }: { isClient: boolean; enabled: boolean }) {
  // `enabled` is the server-truth at page-render time. After successful
  // enrollment in EnableFlow, the local component shows the success view
  // until the user clicks Done — at which point we hard-navigate so the
  // page reloads with the new server truth. Disabling refreshes in place.
  const [optimistic, setOptimistic] = useState<"showing-codes" | null>(null);

  return (
    <div className={isClient ? "border-t border-white/5" : "border-t border-zinc-200/60"}>
      {enabled || optimistic === "showing-codes" ? (
        <DisableForm isClient={isClient} />
      ) : (
        <EnableFlow
          isClient={isClient}
          onDone={() => {
            setOptimistic("showing-codes");
            // Hard reload so the server re-fetches /me and renders the
            // disable form going forward.
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
