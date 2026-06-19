"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { request } from "@/lib/api";
import type { Result } from "@/lib/errors";
import type { Role } from "@/lib/types";

// Web decides the amount — ledger just records the transaction.
const BONUS_AMOUNT: Record<Role, number> = {
  client: 1000,
  insider: 100,
};

export async function claimBonus(): Promise<Result<unknown>> {
  const { userId, role } = await getCurrentUser();
  const res = await request(`${process.env.LEDGER_URL}/api/v1/transactions`, {
    service: "ledger",
    method: "POST",
    body: { user_id: userId, amount: BONUS_AMOUNT[role] },
  });
  if (res.ok) revalidatePath("/wallet");
  return res;
}
