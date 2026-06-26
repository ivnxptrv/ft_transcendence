"use server";

import { getCurrentUser } from "@/lib/auth";
import { request } from "@/lib/api";
import type { Result } from "@/lib/errors";
import type { Transaction, Balance } from "@/lib/types";
import { toCamelCase } from "@/lib/utils";
import { MIN_TOPUP, MAX_TOPUP } from "@/lib/wallet";
import { revalidatePath } from "next/cache";

export async function getBalance(): Promise<Result<Balance>> {
  const { userId } = await getCurrentUser();
  const res = await request<Balance>(`${process.env.LEDGER_URL}/api/v1/balances/${userId}`, {
    service: "ledger",
  });
  // Ledger serializes Decimal as a string — coerce to number at the boundary
  // so the Balance type is honest and downstream code works with a real number.
  if (res.ok) return { ok: true, data: { ...res.data, balance: Number(res.data.balance) } };
  return res;
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

  const res = await request<unknown>(url.toString(), { service: "ledger" });
  if (!res.ok) return res;
  const transactions = (toCamelCase(res.data) as Record<string, unknown>[]).map((item) => ({
    id: String(item.transactionId),
    amount: Number(item.amount),
    createdAt: item.createdAt as string,
  }));
  return { ok: true, data: transactions } as Result<Transaction[]>;
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

export async function topupFunds(amount: number): Promise<Result<unknown>> {
  // Authoritative guard: reject non-finite or out-of-bounds amounts before they
  // reach the ledger (extreme values overflow Numeric(10,2)).
  if (!Number.isFinite(amount) || amount < MIN_TOPUP || amount > MAX_TOPUP) {
    return { ok: false, error: { code: "INVALID" } };
  }
  const { userId } = await getCurrentUser();
  const res = await request(`${process.env.LEDGER_URL}/api/v1/transactions`, {
    service: "ledger",
    method: "POST",
    body: { user_id: userId, amount },
  });
  if (res.ok) revalidatePath("/wallet");
  return res;
}

export async function withdrawFunds(amount: number): Promise<Result<unknown>> {
  const { userId } = await getCurrentUser();
  const res = await request(`${process.env.LEDGER_URL}/api/v1/transactions`, {
    service: "ledger",
    method: "POST",
    body: { user_id: userId, amount: -amount },
  });
  if (res.ok) revalidatePath("/wallet");
  return res;
}
