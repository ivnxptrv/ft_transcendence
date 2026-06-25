"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/app/_components/LanguageSwitcher";

const LINKS = [
  { href: "/dashboard", labelKey: "matches" },
  { href: "/legend", labelKey: "legend" },
  { href: "/wallet", labelKey: "wallet" },
  { href: "/settings", labelKey: "settings" },
] as const;

// `hasLegend` drives the soft nudge: a red dot on "Legend" until the insider
// adds one. Defaults to true so pages that don't know the state show no dot.
export default function InsiderNav({ hasLegend = true }: { hasLegend?: boolean }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tBrand = useTranslations("brand");

  return (
    <nav className="sticky top-0 z-40 bg-[#FAF9F7]/80 backdrop-blur-md border-b border-zinc-200/60 px-6 h-14 flex items-center justify-between font-sans">
      <span className="text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-black">
        {tBrand("name")}
      </span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            const showDot = link.href === "/legend" && !hasLegend;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                {t(link.labelKey)}
                {showDot && (
                  <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#FAF9F7]" />
                )}
              </Link>
            );
          })}
        </div>
        <LanguageSwitcher tone="light" />
      </div>
    </nav>
  );
}
