"use server";

import { getCurrentUser } from "@/lib/auth";
import { toCamelCase } from "@/lib/utils";

export async function getMatches(userId: string) {
  // Matches are non-critical to the dashboard render. A transient interaction
  // outage degrades to an empty list (logged) instead of throwing and crashing
  // the page; a new insider with no matches is the same empty result.
  try {
    const response = await fetch(`${process.env.INTERACTION_URL}/api/v1/matches?insider_id=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.error(`[getMatches] interaction ${response.status}`);
      return [];
    }
    return toCamelCase(await response.json());
  } catch (e) {
    console.error("[getMatches] fetch failed:", e);
    return [];
  }
}

export async function getMatchById(matchId: string) {
  const { userId } = await getCurrentUser();
  const url = new URL(`${process.env.INTERACTION_URL}/api/v1/matches/${matchId}`);

  url.searchParams.set("insider_id", userId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to get match");
  }

  const data = await response.json();

  return toCamelCase(data);
}
