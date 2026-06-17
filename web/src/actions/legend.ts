"use server";

import { getCurrentUser } from "@/lib/auth";

export async function setLegend(text: string) {
  const { userId } = await getCurrentUser();

  const res = await fetch(`${process.env.SEMANTIC_URL}/api/v1/souls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      insider_id: userId,
      text,
    }),
  });

  if (!res.ok)
    throw new Error("Failed to post legend")

  return res.json();

}

// Returns the insider's legend text, or null if they have none yet. Drives the
// dashboard redirect and the nav nudge dot. Empty list from semantic = none.
export async function getLegend(insiderId: string): Promise<string | null> {
  // null means "no legend yet". getSession() calls this on every authenticated
  // page (nav/dashboard/settings/wallet), so a transient semantic outage must
  // degrade to null (logged) rather than throw and crash all of them.
  try {
    const res = await fetch(
      `${process.env.SEMANTIC_URL}/api/v1/souls?insider_id=${encodeURIComponent(insiderId)}`,
      { cache: "no-store" },
    );
    if (!res.ok) {
      console.error(`[getLegend] semantic ${res.status}`);
      return null;
    }
    const souls = (await res.json()) as { text?: string }[];
    const text = souls[0]?.text;
    return text?.trim() ? text : null;
  } catch (e) {
    console.error("[getLegend] fetch failed:", e);
    return null;
  }
}
