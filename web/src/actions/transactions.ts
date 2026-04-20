"use server";

import { getCurrentUser } from "@/actions/auth";

export async function getBalance() {
  const userId = getCurrentUser();

  const res = await fetch(`${process.env.LEDGER_URL}/balances?userId=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

export async function getTransactions() {
  const userId = getCurrentUser();

  const res = await fetch(`${process.env.LEDGER_URL}/transactions?userId=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

export async function submitPurchase(insightId: string) {
  const userId = getCurrentUser();

  const res = await fetch(`${process.env.LEDGER_URL}/purchases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      insightId,
    }),
  });

  // 500 - Insufficient Balance
  if (!res.ok) return res.json();

  return res.json();
}
