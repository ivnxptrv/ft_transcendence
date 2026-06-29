import { readFileSync } from "node:fs";
import { join } from "node:path";

import { routing } from "@/i18n/routing";

// Loads the legal document for a locale, e.g. `terms.fr.md`, falling back to the
// default-locale copy when a translation is missing. Server-only (uses fs); the
// legal pages are statically generated per locale, so this runs at build time.
const DIR = join(process.cwd(), "src/content/legal");

export function loadLegalDoc(slug: "terms" | "privacy", locale: string): string {
  try {
    return readFileSync(join(DIR, `${slug}.${locale}.md`), "utf8");
  } catch {
    return readFileSync(join(DIR, `${slug}.${routing.defaultLocale}.md`), "utf8");
  }
}
