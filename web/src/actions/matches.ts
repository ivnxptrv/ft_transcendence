"use server";

import { getCurrentUser } from "@/lib/auth";
import { request } from "@/lib/api";
import type { Result } from "@/lib/errors";
import { toCamelCase } from "@/lib/utils";
import type { Match } from "@/lib/types";

export async function getMatches(
  userId: string,
  params?: { limit?: number; offset?: number; status?: string },
): Promise<Result<{ matches: Match[]; total: number }>> {
  const url = new URL(`${process.env.INTERACTION_URL}/api/v1/matches`);
  url.searchParams.set("insider_id", userId);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.offset) url.searchParams.set("offset", String(params.offset));
  if (params?.status) url.searchParams.set("status", params.status);

  const res = await request<unknown>(url.toString(), { service: "interaction" });
  if (!res.ok) return res;
  const matches = toCamelCase(res.data) as Match[];
  // Full result-set size for the pager; header set by interaction.
  const total = Number(res.headers?.get("x-total-count") ?? matches.length);
  return { ok: true, data: { matches, total } };
}

export async function getMatchById(matchId: string): Promise<Result<Match>> {
  const { userId } = await getCurrentUser();
  const url = new URL(`${process.env.INTERACTION_URL}/api/v1/matches/${matchId}`);
  url.searchParams.set("insider_id", userId);

  const res = await request<unknown>(url.toString(), { service: "interaction" });
  return res.ok ? { ok: true, data: toCamelCase(res.data) as Match } : res;
}
