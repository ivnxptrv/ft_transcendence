import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Markdown from "react-markdown";

import { LegalPage } from "@/app/_components/LegalPage";

export const metadata: Metadata = { title: "Terms of Service — Vekko" };

// Content lives as a plain markdown document; read once at module load.
const source = readFileSync(
  join(process.cwd(), "src/content/legal/terms.md"),
  "utf8",
);

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage>
      <Markdown>{source}</Markdown>
    </LegalPage>
  );
}
