import { getCurrentUser } from "@/lib/auth";
import { setRequestLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";

// Uses cookies (session) — can't be statically prerendered.
export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await getCurrentUser();
  redirect({ href: "/dashboard", locale });
}
