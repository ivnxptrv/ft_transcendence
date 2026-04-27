export type Role = "client" | "insider";

// -- Auth --
export type UserPayload = {
  userId: string;
  accessToken: string;
  role: Role;
  name: string;
  email: string;
};

// --- Shared ---
export type OrderStatus = "pending" | "has_responses" | "completed";
export type MatchStatus = "new" | "responded" | "purchased" | "rated";

// --- Client ---
export type Order = {
  id: string;
  title: string;
  text: string;
  status: OrderStatus;
  createdAt: Date;
  insightCount: number;
};

export type InsightCard = {
  id: string;
  orderId: string;
  insiderLegend: string;
  price: number;
  credibilityScore: number;
  insiderInsight?: string;
  isUnlocked: boolean;
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
  query: string;
  insiderId: string;
  status: MatchStatus;
  matchScore: number;
  receivedAt: Date;
  insight?: Insight;
};

export type InsiderProfile = {
  userId: string;
  legend?: string;
  credibilityScore: number;
  totalEarnings: number;
  totalResponses: number;
  avgRating: number;
};

export type Transaction = {
  id: string;
  description: string;
  amount: number; // positive = credit (top-up/earnings), negative = debit (purchase)
  date: Date;
};
