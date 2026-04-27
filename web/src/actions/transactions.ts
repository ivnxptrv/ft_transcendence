"use server";

import { getCurrentUser } from "@/lib/auth";
import type { Transaction } from "@/lib/types";

export async function getBalance(): Promise<number> {
  // const userId = await getCurrentUser();
  // const res = await fetch(`${process.env.LEDGER_URL}/balances?userId=${userId}`, {
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });
  // return res.json();
  return 1200;
}

export async function getTransactions(): Promise<Transaction[]> {
  // const userId = await getCurrentUser();
  // const res = await fetch(`${process.env.LEDGER_URL}/transactions?userId=${userId}`, {
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });
  // return res.json();
  return [
    {
      id: "1",
      amount: 50,
      description: "",
      date: new Date(),
    },
    {
      id: "2",
      amount: 100,
      description: "",
      date: new Date(),
    },
    {
      id: "3",
      amount: 150,
      description: "",
      date: new Date(),
    },
  ];
}

export async function submitPurchase(insightId: string) {
  const userId = await getCurrentUser();

  const res = await fetch(`${process.env.LEDGER_URL}/purchases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      insightId,
      userId,
    }),
  });

  // 500 - Insufficient Balance
  if (!res.ok) return res.json();

  return res.json();
}
