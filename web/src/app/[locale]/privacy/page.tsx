import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Markdown from "react-markdown";

import { LegalPage } from "@/app/_components/LegalPage";
import { loadLegalDoc } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy — Vekko" };

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage>
      <Markdown>{loadLegalDoc("privacy", locale)}</Markdown>
    </LegalPage>
  );
}
