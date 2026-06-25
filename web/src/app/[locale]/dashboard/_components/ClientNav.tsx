"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/app/_components/LanguageSwitcher";

const LINKS = [
  { href: "/dashboard", labelKey: "orders" },
  { href: "/wallet", labelKey: "wallet" },
  { href: "/settings", labelKey: "settings" },
] as const;

export default function ClientNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tBrand = useTranslations("brand");

  return (
    <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 h-14 flex items-center justify-between font-sans">
      <span className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black">
        {" "}
        {tBrand("name")}
      </span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-white text-black"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </div>
        <LanguageSwitcher tone="dark" />
      </div>
    </nav>
  );
}
