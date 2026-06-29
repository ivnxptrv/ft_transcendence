import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFoundPage");
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">{t("code")}</h1>
        <p className="text-2xl mb-6">{t("title")}</p>
        <Link
          href="/dashboard"
          className="underline text-white hover:text-zinc-400 transition-colors"
        >
          {t("returnDashboard")}
        </Link>
      </div>
    </div>
  );
}
