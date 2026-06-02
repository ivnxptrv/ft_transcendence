"use server";

import { revalidatePath } from "next/cache";

export async function submitMatchInsight(
  userId: string,
  matchId: string,
  text: string,
  price: number
) {
  const res = await fetch(`${process.env.INTERACTION_URL}/api/v1/insights?user_id=${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
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
