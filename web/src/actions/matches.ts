"use server";

export async function getMatches(userId: string) {
  const res = await fetch(`${process.env.INTERACTION_URL}/api/v1/matches?user_id=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch matches");
  }

  const matches = await res.json();
  return matches;
}
