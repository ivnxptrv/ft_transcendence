export type Role = "client" | "insider";

// -- Auth --
export type UserPayload = {
  userId: string;
  accessToken: string;
  role: Role;
  name: string;
  email: string;
};

export type SessionUser = {
  userId: string;
  role: Role;
};

export type UserProfile = {
  id: string;
  email: string;
  role: Role;
  // first_name is required; last_name is optional.
  first_name: string;
  last_name: string | null;
  totp_enabled: boolean;
  // False for OAuth-only accounts (no password set) — drives the settings
  // "set password" affordance.
  has_password: boolean;
};

// --- Shared ---
export type OrderStatus = "pending" | "has_responses" | "completed";

// --- Client ---
export type Order = {
  id: string;
  title: string;
  text: string;
  status: OrderStatus;
  createdAt: string;
};

export type InsightCard = {
  id: string;
  orderId: string;
  legend: string;
  text: string;
  price: number;
  isPaid: boolean;
};

// --- Insider ---

export type Insight = {
  id: string;
  matchId: string;
  text: string;
  price: number;
};

export type Match = {
  id: string;
  orderId: string;
  text: string;
  score: number;
  insiderId: string;
};

export type Transaction = {
  id: string;
  amount: number;
  createdAt: string;
};

export type Balance = {
  userId: string;
  balance: number;
};
