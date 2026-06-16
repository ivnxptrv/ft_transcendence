"use server";

import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitMatchInsight(matchId: string, text: string, price: number) {
  const { userId } = await getCurrentUser();

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
