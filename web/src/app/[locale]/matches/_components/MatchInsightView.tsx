import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { MatchStatus } from "@/lib/types";
import { MATCH_STATUS_LABEL, MATCH_STATUS_VARIANT } from "@/lib/matches";

// Read-only insight, shown when the insider already submitted for this match.
// Replaces the submit form so a sent insight can't be entered twice. Presented
// as page content, not an editable form. `text`/`price` are absent if the
// insight couldn't be loaded — then only the status and a generic note render.
export function MatchInsightView({
  status,
  text,
  price,
}: {
  status: MatchStatus;
  text?: string;
  price?: number;
}) {
  const t = useTranslations("matches");
  const tStatus = useTranslations("status");
  const paid = status === "completed";

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
          {t("yourInsight")}
        </span>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${MATCH_STATUS_VARIANT[status]}`}
        >
          {tStatus(MATCH_STATUS_LABEL[status])}
        </span>
      </div>

      {text ? (
        <p className="text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap break-words">
          {text}
        </p>
      ) : (
        <p className="text-sm text-zinc-400">{t("alreadySubmitted")}</p>
      )}

      {price !== undefined && (
        <div className="flex items-center justify-between border-t border-zinc-200 pt-5">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
            {t("unlockPrice")}
          </span>
          <span className="text-lg font-bold text-zinc-900">${price}</span>
        </div>
      )}

      <p
        className={`text-xs leading-relaxed ${paid ? "text-emerald-600 font-medium" : "text-zinc-400"}`}
      >
        {paid
          ? price !== undefined
            ? t("unlockedInWallet", { price })
            : t("unlockedEarnings")
          : price !== undefined
            ? t("willEarnPrice", { price })
            : t("willEarn")}
      </p>

      <Link
        href="/dashboard"
        className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors"
      >
        {t("backToMatches")}
      </Link>
    </section>
  );
}
