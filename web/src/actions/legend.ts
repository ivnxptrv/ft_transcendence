"use server";

import { getCurrentUser } from "@/lib/auth";
import { request } from "@/lib/api";
import type { Result } from "@/lib/errors";

export async function setLegend(text: string): Promise<Result<unknown>> {
  const { userId } = await getCurrentUser();
  return request(`${process.env.SEMANTIC_URL}/api/v1/souls`, {
    service: "semantic",
    method: "POST",
    body: { insider_id: userId, text },
  });
}

// Result<string | null>: data is the legend text, or null when semantic
// confirms there is none yet (empty list). A failed Result (ok:false) means
// semantic was unreachable — distinct from "no legend", so callers never
// mistake an outage for absence.
export async function getLegend(insiderId: string): Promise<Result<string | null>> {
  const res = await request<{ text?: string }[]>(
    `${process.env.SEMANTIC_URL}/api/v1/souls?insider_id=${encodeURIComponent(insiderId)}`,
    { service: "semantic" },
  );
  if (!res.ok) return res;
  const text = res.data[0]?.text;
  return { ok: true, data: text?.trim() ? text : null };
}
