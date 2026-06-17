"use server";

import { getCurrentUser } from "@/lib/auth";
import { toCamelCase } from "@/lib/utils";

export async function getMatches(userId: string) {
  const response = await fetch(`${process.env.INTERACTION_URL}/api/v1/matches?insider_id=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch matches");
  }
  const data = await response.json();

  return toCamelCase(data);
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
