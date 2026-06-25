"use client";

import type { Match } from "@/lib/types";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { submitMatchInsight } from "@/actions/insights";
import { messageFor } from "@/lib/errors";

export function MatchInsightForm({ match, legend }: { match: Match; legend: string }) {
  const t = useTranslations("matches");
  const tErrors = useTranslations("errors");
  const [response, setResponse] = useState("");
  const [price, setPrice] = useState(150);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleSkip() {
    router.push("/dashboard");
  }

  async function handleSubmit() {
    // Hard validation: highlight the offending field on submit (mirrors the
    // new-order form). Errors clear as the user edits (see onChange handlers).
    const textEmpty = !response.trim();
    const priceInvalid = !(price > 0);
    if (textEmpty) setTextError(t("writeBeforeSaving"));
    if (priceInvalid) setPriceError(t("setValue"));
    if (textEmpty || priceInvalid) return;

    setError(null);
    setLoading(true);
    const res = await submitMatchInsight(match.id, legend, response.trim(), price);
    if (res.ok) {
      setSubmitted(true);
    } else {
      setError(tErrors(messageFor("interaction.insights", res.error.code)));
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-zinc-900">{t("insightSubmitted")}</p>
          <p className="text-sm text-zinc-400 mt-1">{t("clientNotified", { price })}</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors cursor-pointer"
        >
          {t("backToMatches")}
        </button>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="space-y-3">
        <div className="px-1">
          <h2 className="text-[10px] text-zinc-900 uppercase tracking-widest font-black">
            {t("yourInsight")}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">{t("writeFromExperience")}</p>
        </div>
        <textarea
          value={response}
          onChange={(e) => {
            setResponse(e.target.value);
            if (textError) setTextError(null);
          }}
          className={`w-full bg-white border rounded-3xl p-6 text-base text-zinc-800 placeholder:text-zinc-300 leading-relaxed resize-none h-48 outline-none transition-all font-sans break-words ${textError ? "border-red-500/60" : "border-zinc-200 focus:border-zinc-400"}`}
          placeholder={t("insightPlaceholder")}
        />
        {textError && <p className="text-xs text-red-500 px-1">{textError}</p>}
      </div>

      <div className="space-y-3">
        <h2 className="text-[10px] text-zinc-900 uppercase tracking-widest font-black px-1">
          {t("unlockPriceLabel")}
        </h2>
        <div
          className={`flex items-center gap-4 bg-white border rounded-2xl p-4 ${priceError ? "border-red-500/60" : "border-zinc-200"}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-zinc-300 font-bold">$</span>
            <input
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(Number(e.target.value));
                if (priceError) setPriceError(null);
              }}
              min={0}
              step={10}
              className="bg-transparent text-xl font-black text-zinc-900 w-20 outline-none"
            />
          </div>
          <div className="h-4 w-px bg-zinc-100" />
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-tighter">
            {t("setValue")}
          </span>
        </div>
        {priceError && <p className="text-xs text-red-500 px-1">{priceError}</p>}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-8">
        <button
          onClick={handleSkip}
          className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest hover:text-red-500 transition-colors cursor-pointer"
        >
          {t("skipOrder")}
        </button>
        <div className="flex flex-col items-end gap-2">
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-zinc-900 text-white rounded-full px-10 py-4 text-sm font-bold hover:bg-black active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("submitInsight")}
          </button>
        </div>
      </div>

      <div className="bg-amber-100/50 border border-amber-200/50 rounded-2xl p-6">
        <p className="text-[11px] text-amber-900/70 leading-relaxed font-medium">
          {t("earningsNotice", { price })}
        </p>
      </div>
    </section>
  );
}
