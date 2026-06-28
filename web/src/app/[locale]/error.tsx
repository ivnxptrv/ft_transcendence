"use client";

import { useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";

// Per-route boundary for unexpected render errors (in-place SectionError handles
// expected downstream failures). Doesn't leak the raw error to the user — logs
// it and offers Retry (with pending feedback) + a way back.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    console.error("[route error]", error);
  }, [error]);

  function retry() {
    startTransition(() => {
      reset();
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-bold mb-2">{t("title")}</h1>
        <p className="text-sm text-zinc-400 mb-6">{t("description")}</p>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={retry}
            disabled={pending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {pending && (
              <span className="w-3 h-3 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin" />
            )}
            {pending ? t("retrying") : t("retry")}
          </button>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-400 underline underline-offset-4 hover:text-white transition-colors"
          >
            {t("dashboard")}
          </Link>
        </div>
      </div>
    </div>
  );
}
