import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

// Global site footer. Keeps the legally-required Privacy Policy and Terms of
// Service links reachable from every page (subject mandate). Self-contained dark
// styling so it reads as a deliberate footer under both the dark (client) and
// light (insider) page themes. Width matches the app's standard content measure
// (max-w-2xl) so it reads as a continuation of the page column above it rather
// than a sprawling full-width bar; the copyright is centered below the brand
// and legal links, bounded within the same container.
export async function Footer() {
  const t = await getTranslations("footer");
  const tBrand = await getTranslations("brand");

  return (
    <footer className="border-t border-white/10 bg-zinc-950 text-zinc-500">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-sm font-bold text-zinc-300">{tBrand("name")}</span>
            <span className="text-[11px]">{tBrand("tagline")}</span>
          </div>
          <nav className="flex items-center gap-6 text-[12px]">
            <Link href="/privacy" className="transition-colors hover:text-zinc-200">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-zinc-200">
              {t("terms")}
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-center text-[10px] text-zinc-600">{t("copyright")}</p>
      </div>
    </footer>
  );
}
