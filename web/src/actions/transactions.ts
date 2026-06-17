"use server";

import { getCurrentUser } from "@/lib/auth";
import { request } from "@/lib/api";
import type { Result } from "@/lib/errors";
import type { Transaction, Balance } from "@/lib/types";

export async function getBalance(): Promise<Result<Balance>> {
  const { userId } = await getCurrentUser();
  return request<Balance>(`${process.env.LEDGER_URL}/api/v1/balances/${userId}`, {
    service: "ledger",
  });
}

export async function getTransactions(params?: {
  limit?: number;
  offset?: number;
}): Promise<Result<Transaction[]>> {
  const { userId } = await getCurrentUser();

  const url = new URL(`${process.env.LEDGER_URL}/api/v1/transactions`);
  url.searchParams.set("user_id", userId);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.offset) url.searchParams.set("offset", String(params.offset));

  return request<Transaction[]>(url.toString(), { service: "ledger" });
}

// insight_id is a string here — Ledger expects int. Ledger should return 409 for
// insufficient funds; on a non-409 the UI shows the generic message.
export async function submitPurchase(insightId: string): Promise<Result<unknown>> {
  const { userId } = await getCurrentUser();
  return request(`${process.env.LEDGER_URL}/api/v1/purchases`, {
    service: "ledger",
    method: "POST",
    body: { client_id: userId, insight_id: Number(insightId) },
  });
}
