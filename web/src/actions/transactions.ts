"use server";

import { getCurrentUser } from "@/lib/auth";
import type { Transaction, Balance } from "@/lib/types";

export async function getBalance(): Promise<Balance> {
  const { userId } = await getCurrentUser();

  const response = await fetch(`${process.env.LEDGER_URL}/api/v1/balances/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok)
    throw new Error("Failed to get wallet balance");
  
  return response.json();
}

export async function getTransactions(params?: { limit?: number; offset?: number }): Promise<Transaction[]> {
  const { userId } = await getCurrentUser();

  const url = new URL(`${process.env.LEDGER_URL}/api/v1/transactions`)
  url.searchParams.set("user_id", userId);
  if (params?.limit) {
    url.searchParams.set("limit", params.limit.toString());
  }
  if (params?.offset) {
    url.searchParams.set("offset", params.offset.toString());
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok)
    throw new Error("Failed to get transactions list");

  return response.json();
}

// insight_id is a string — Ledger expects int
export async function submitPurchase(insightId: string) {
  const { userId } = await getCurrentUser();

  const response = await fetch(`${process.env.LEDGER_URL}/api/v1/purchases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: userId,
      insight_id: Number(insightId),
    }),
  });

  // 500 - Insufficient Balance
  if (!response.ok)
    throw new Error("Insufficient Balance");

  return response.json();
}
