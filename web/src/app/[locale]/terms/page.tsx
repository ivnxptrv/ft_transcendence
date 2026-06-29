import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Markdown from "react-markdown";

import { LegalPage } from "@/app/_components/LegalPage";
import { loadLegalDoc } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms of Service — Vekko" };

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage>
      <Markdown>{loadLegalDoc("terms", locale)}</Markdown>
    </LegalPage>
  );
}
