"use client";

import { useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

// Dashboard error boundary. Safety net for any throw during the server render
// not handled in-place. Logs the cause and offers Retry with pending feedback.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("dashboardError");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    console.error("[dashboard] render failed:", error);
  }, [error]);

  function retry() {
    startTransition(() => {
      reset();
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#2A2520] font-sans flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-bold text-zinc-900 mb-2">{t("title")}</h1>
        <p className="text-sm text-zinc-500 mb-6">{t("description")}</p>
        <button
          type="button"
          onClick={retry}
          disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {pending && (
            <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
          )}
          {pending ? t("retrying") : t("retry")}
        </button>
      </div>
    </div>
  );
}
