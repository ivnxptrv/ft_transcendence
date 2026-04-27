"use server";

import { revalidatePath } from "next/cache";
// import { getCurrentUser } from "./auth";

export async function getMatches(userId: string) {
  const res = await fetch(`${process.env.INTERACTION_URL}/matches?userId=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  // check code
  if (!res.ok) {
    throw new Error("Failed to fetch matches");
  }

  const matches = await res.json();
  return matches;
}

// export async function getMatchById(id: string) {
//   const matches = await getMatches();

//   return matches.find((m) => m.id === id) ?? null;
// }

export async function submitMatchInsight(
  userId: string,
  matchId: string,
  text: string,
  price: number
) {
  const res = await fetch(`${process.env.INTERACTION_URL}/insights`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      matchId,
      text,
      price,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to submit match insight");
  }
  revalidatePath("/dashboard");
}
