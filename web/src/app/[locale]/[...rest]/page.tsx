import { notFound } from "next/navigation";

// Catch-all so unknown routes within the [locale] segment render the localized
// not-found page (e.g. /en/unknown). Without this, only explicit notFound()
// calls trigger the not-found boundary.
export default function CatchAllPage() {
  notFound();
}
