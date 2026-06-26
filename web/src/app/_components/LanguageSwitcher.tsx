"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchTo(newLocale: string) {
    if (newLocale === locale) return;
    setOpen(false);
    router.replace(pathname, { locale: newLocale });
  }

  const isDark = tone === "dark";

  const triggerClass = isDark
    ? "text-zinc-400 hover:text-white"
    : "text-zinc-500 hover:text-zinc-900";

  const menuBg = isDark
    ? "bg-black/90 border-white/10"
    : "bg-white/95 border-zinc-200/60";

  const itemBase = isDark
    ? "text-zinc-400 hover:text-white hover:bg-white/5"
    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100";

  const itemActive = isDark ? "text-white bg-white/10" : "text-zinc-900 bg-zinc-100";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1 py-0.5 rounded transition-colors cursor-pointer ${triggerClass}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("label")}
      >
        {locale.toUpperCase()}
        <svg
          className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("label")}
          className={`absolute right-0 top-full mt-1 rounded-lg border backdrop-blur-md py-1 min-w-[130px] shadow-lg ${menuBg}`}
        >
          {routing.locales.map((l) => (
            <li key={l} role="option" aria-selected={l === locale}>
              <button
                type="button"
                onClick={() => switchTo(l)}
                className={`w-full text-left text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 transition-colors cursor-pointer ${
                  l === locale ? itemActive : itemBase
                }`}
              >
                {t(l as "en" | "th" | "ru" | "fr")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
