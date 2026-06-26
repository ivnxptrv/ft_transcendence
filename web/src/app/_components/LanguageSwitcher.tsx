"use client";

import { useLocale, useTranslations } from "next-intl";

import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// Compact locale switcher (EN · TH · RU) that stays on the same page when
// switching. `tone` matches the parent nav's colour scheme.
export function LanguageSwitcher({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");

  function switchTo(newLocale: string) {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  }

  const activeClass = tone === "dark" ? "text-white" : "text-zinc-900";
  const inactiveClass =
    tone === "dark" ? "text-zinc-600 hover:text-white" : "text-zinc-400 hover:text-zinc-900";
  const dividerClass = tone === "dark" ? "text-zinc-700" : "text-zinc-300";

  return (
    <div className="flex items-center text-[10px] font-bold uppercase tracking-wider">
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className={`mx-0.5 ${dividerClass}`}>·</span>}
          <button
            type="button"
            onClick={() => switchTo(l)}
            aria-label={t(l as "en" | "th" | "ru" | "fr")}
            className={`px-1 py-0.5 rounded transition-colors cursor-pointer ${
              l === locale ? activeClass : inactiveClass
            }`}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
