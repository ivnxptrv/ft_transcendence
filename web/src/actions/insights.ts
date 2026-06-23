"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { request } from "@/lib/api";
import { toCamelCase } from "@/lib/utils";
import type { Result } from "@/lib/errors";
import type { Insight } from "@/lib/types";

// The insider's submitted insight for a match, or null if none yet. Lists the
// order's insights and picks the one tied to this match — backs the read-only
// view shown once an insight exists, so the submit form isn't offered again.
export async function getMatchInsight(
  orderId: string,
  matchId: string,
): Promise<Result<Insight | null>> {
  const res = await request<unknown>(
    `${process.env.INTERACTION_URL}/api/v1/insights?order_id=${encodeURIComponent(orderId)}`,
    { service: "interaction" },
  );
  if (!res.ok) return res;
  const list = toCamelCase(res.data) as Insight[];
  const found = list.find((i) => String(i.matchId) === String(matchId)) ?? null;
  return { ok: true, data: found };
}

export async function submitMatchInsight(
  matchId: string,
  legend: string,
  text: string,
  price: number,
): Promise<Result<unknown>> {
  const { userId } = await getCurrentUser();
  const res = await request(
    `${process.env.INTERACTION_URL}/api/v1/insights`,
    {
      service: "interaction",
      method: "POST",
      body: { match_id: Number(matchId), insider_id: userId, legend, text, price },
    },
  );
  if (res.ok) revalidatePath("/dashboard");
  return res;
}
