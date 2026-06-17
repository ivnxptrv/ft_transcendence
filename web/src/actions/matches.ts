"use server";

import { getCurrentUser } from "@/lib/auth";
import { request } from "@/lib/api";
import type { Result } from "@/lib/errors";
import { toCamelCase } from "@/lib/utils";
import type { Match } from "@/lib/types";

export async function getMatches(userId: string): Promise<Result<Match[]>> {
  const res = await request<unknown>(
    `${process.env.INTERACTION_URL}/api/v1/matches?insider_id=${userId}`,
    { service: "interaction" },
  );
  return res.ok ? { ok: true, data: toCamelCase(res.data) as Match[] } : res;
}

export async function getMatchById(matchId: string): Promise<Result<Match>> {
  const { userId } = await getCurrentUser();
  const url = new URL(`${process.env.INTERACTION_URL}/api/v1/matches/${matchId}`);
  url.searchParams.set("insider_id", userId);

  const res = await request<unknown>(url.toString(), { service: "interaction" });
  return res.ok ? { ok: true, data: toCamelCase(res.data) as Match } : res;
}
