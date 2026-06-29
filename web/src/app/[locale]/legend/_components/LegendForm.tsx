"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import { setLegend } from "@/actions/legend";
import { messageFor } from "@/lib/errors";
import { Modal } from "@/app/_components/Modal";

// Create form, shown only when the insider has no legend yet. Create-once:
// after saving there's no edit path, so this never renders again.
export function LegendForm() {
  const t = useTranslations("legend");
  const tErrors = useTranslations("errors");
  const [legend, setLegendValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [legendError, setLegendError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    // Hard validation: highlight the field on submit (mirrors the order/insight
    // forms). The error clears as the user types (see onChange).
    if (!legend.trim()) {
      setLegendError(t("writeBeforeSaving"));
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await setLegend(legend.trim());
      if (res.ok) {
        // Confirm in place rather than redirecting — the success modal owns the
        // hand-off to matches. Dismissing it refreshes to the read-only view.
        setSaved(true);
      } else {
        setError(tErrors(messageFor("semantic.legend", res.error.code)));
      }
    });
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="space-y-1.5">
        <label htmlFor="legend" className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold px-1">
          {t("expertise")}
        </label>
        <textarea
          id="legend"
          value={legend}
          onChange={(e) => {
            setLegendValue(e.target.value);
            if (legendError) setLegendError(null);
          }}
          placeholder={t("placeholder")}
          className={`w-full bg-white border rounded-3xl p-6 text-base text-zinc-800 placeholder:text-zinc-300 leading-relaxed resize-none h-64 outline-none transition-all font-sans break-words ${legendError ? "border-red-500/60" : "border-zinc-200 focus:border-zinc-400"}`}
        />
        {legendError && <p className="text-xs text-red-500 px-1">{legendError}</p>}
      </div>

      {error && <p className="text-xs text-red-500 px-1">{error}</p>}

      <div className="mt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="w-full rounded-full py-4 text-sm font-bold active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-zinc-200 bg-zinc-900 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? t("saving") : t("save")}
        </button>
        <p className="text-[10px] text-zinc-400 text-center mt-6 uppercase tracking-widest font-bold">
          {t("tip")}
        </p>
      </div>

      <Modal open={saved} onClose={() => router.refresh()} className="max-w-md">
        <div className="bg-[#FAF9F7] rounded-3xl border border-black/10 p-8 shadow-2xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-7 w-7 text-emerald-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">{t("discoverable")}</h2>
          <p className="text-sm text-zinc-500 leading-relaxed mb-6">{t("legendLive")}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-block bg-zinc-900 text-white rounded-full px-6 py-3 text-sm font-bold hover:bg-zinc-800 transition-colors"
          >
            {t("checkMatches")}
          </button>
        </div>
      </Modal>
    </section>
  );
}
