"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { request } from "@/lib/api";
import type { Result } from "@/lib/errors";

export async function submitMatchInsight(
  matchId: string,
  text: string,
  price: number,
): Promise<Result<unknown>> {
  const { userId } = await getCurrentUser();
  const res = await request(
    `${process.env.INTERACTION_URL}/api/v1/insights?user_id=${userId}`,
    {
      service: "interaction",
      method: "POST",
      body: { matchId, text, price },
    },
  );
  if (res.ok) revalidatePath("/dashboard");
  return res;
}
