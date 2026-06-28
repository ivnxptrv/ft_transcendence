"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Modal } from "@/app/_components/Modal";

// Shown once per login on the dashboard (the insider's landing) when they have
// no legend yet. The CTA links to the legend page so they can create it. Keyed
// in sessionStorage so it fires on first login only, not on every navigation
// back to the dashboard.
//
// Mounted client-only via next/dynamic (ssr: false) — see LegendNudgeModalLazy.
// Because this never renders on the server, the lazy initializer can read
// sessionStorage directly without a hydration mismatch or an effect-setState.
export function LegendNudgeModal({ hasLegend, userId }: { hasLegend: boolean; userId: string }) {
  const t = useTranslations("legend");
  const [open, setOpen] = useState(() => {
    if (hasLegend) return false;
    const key = `legend_nudge:${userId}`;
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
    return true;
  });

  return (
    <Modal open={open} onClose={() => setOpen(false)} className="max-w-md">
      <div className="bg-[#FAF9F7] rounded-3xl border border-black/10 p-8 shadow-2xl text-center">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">{t("becomeDiscoverable")}</h2>
        <p className="text-sm text-zinc-500 leading-relaxed mb-6">{t("nudgeDesc")}</p>
        <Link
          href="/legend"
          onClick={() => setOpen(false)}
          className="inline-block bg-zinc-900 text-white rounded-full px-6 py-3 text-sm font-bold hover:bg-zinc-800 transition-colors"
        >
          {t("createLegend")}
        </Link>
      </div>
    </Modal>
  );
}
