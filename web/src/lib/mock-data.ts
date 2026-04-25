import { Order, InsightCard, Match, InsiderProfile, Transaction } from "@/lib/types";

// --- CLIENT MOCK DATA ---

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord_001",
    title: "Freelancing in Bangkok",
    text: "What is it actually like to quit a stable job and go freelance in Bangkok? Not the blog-post version.",
    status: "has_responses",
    createdAt: new Date("2025-01-14T09:22:00Z"),
    insightCount: 3,
  },
  {
    id: "ord_002",
    title: "Foreigner mortgage in Thailand",
    text: "How do people actually navigate getting a mortgage as a foreigner in Thailand?",
    status: "pending",
    createdAt: new Date("2025-01-15T14:05:00Z"),
    insightCount: 0,
  },
  {
    id: "ord_003",
    title: "Early-stage burnout",
    text: "What does early-stage burnout feel like before you realise that's what it is?",
    status: "completed",
    createdAt: new Date("2025-01-10T11:30:00Z"),
    insightCount: 4,
  },
];

export const MOCK_INSIGHTS: InsightCard[] = [
  {
    id: "resp_001",
    orderId: "ord_001",
    insiderLegend:
      "Freelance developer, 4 years in Bangkok after leaving a corporate role in Singapore.",
    price: 120,
    credibilityScore: 4.7,
    isUnlocked: false,
    insiderInsight:
      "The first three months are a psychological game, not a financial one. I had runway but kept second-guessing every decision. What shifted things was treating it like a business from day one — separate accounts, weekly invoicing, real contracts. Bangkok made it easier because costs are low enough that one solid client covers your life.",
  },
  {
    id: "resp_002",
    orderId: "ord_001",
    insiderLegend: "UX designer who made the leap from agency work; lived through two dry months.",
    price: 80,
    credibilityScore: 4.2,
    isUnlocked: true,
    insiderInsight:
      "The first thing nobody tells you is that the isolation hits before the money stress does. You wake up at 10am because you can, and by noon you're wondering if you've made a catastrophic mistake. The income gap in month 2 was real — I had savings but kept not touching them out of stubbornness. What actually saved me was landing one anchor client at 60% of my old salary. Everything else felt like a bonus after that.",
  },
  {
    id: "resp_003",
    orderId: "ord_001",
    insiderLegend:
      "Content strategist, went full-time freelance after being retrenched; 3 years out now.",
    price: 95,
    credibilityScore: 3.9,
    isUnlocked: false,
    insiderInsight:
      "Being retrenched actually helped — I had no choice but to commit. The hardest part was pricing: I undercharged for the first six months out of fear. Once I doubled my rate, I lost two small clients and gained one better one who respected my time. The math worked out and the stress halved.",
  },
];

// --- INSIDER MOCK DATA ---

export const MOCK_MATCHES: Match[] = [
  {
    id: "match_001",
    orderId: "ord_001",
    insiderId: "insider_001",
    query:
      "What is it actually like to quit a stable job and go freelance in Bangkok? Not the blog-post version.",
    matchScore: 0.94,
    status: "new",
    receivedAt: new Date("2025-01-15T08:00:00Z"),
  },
  {
    id: "match_002",
    orderId: "ord_004",
    insiderId: "insider_003",
    query:
      "How do you deal with imposter syndrome when you've been promoted into a leadership role you didn't expect?",
    matchScore: 0.87,
    status: "responded",
    receivedAt: new Date("2025-01-14T12:00:00Z"),
    insight: {
      id: "ins_001",
      matchId: "match_002",
      text: "Responded — awaiting client review.",
      price: 150,
    },
  },
  {
    id: "match_003",
    orderId: "ord_005",
    insiderId: "insider_002",
    query:
      "What does the early stage of starting a business in SEA actually look like — the admin, the loneliness, the doubt?",
    matchScore: 0.81,
    status: "purchased",
    receivedAt: new Date("2025-01-12T09:30:00Z"),
    insight: {
      id: "ins_002",
      matchId: "match_003",
      text: "Purchased — client has unlocked this response.",
      price: 200,
    },
  },
  {
    id: "match_004",
    orderId: "ord_006",
    insiderId: "insider_001",
    query:
      "Realistic picture of dating as an expat in Bangkok — patterns, pitfalls, what nobody says publicly.",
    matchScore: 0.76,
    status: "new",
    receivedAt: new Date("2025-01-15T10:15:00Z"),
  },
];

export const MOCK_INSIDER_PROFILE: InsiderProfile[] = [
  {
    userId: "insider_001",
    legend: "Freelance developer, 4 years in Bangkok after leaving a corporate role in Singapore.",
    credibilityScore: 4.5,
    totalEarnings: 12000,
    totalResponses: 120,
    avgRating: 4.5,
  },
  {
    userId: "insider_002",
    credibilityScore: 4.2,
    totalEarnings: 8000,
    totalResponses: 80,
    avgRating: 4.2,
  },
  {
    userId: "insider_003",
    credibilityScore: 3.9,
    totalEarnings: 6000,
    totalResponses: 60,
    avgRating: 3.9,
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "txn_001",
    description: "Unlocked insight",
    amount: -120,
    date: new Date("2025-01-14T10:00:00Z"),
  },
  {
    id: "txn_002",
    description: "Top up",
    amount: 500,
    date: new Date("2025-01-12T09:00:00Z"),
  },
  {
    id: "txn_003",
    description: "Unlocked insight",
    amount: -95,
    date: new Date("2025-01-10T14:30:00Z"),
  },
];

// --- GETTERS (The "Fake API") ---
export async function getOrders() {
  return MOCK_ORDERS;
}
export async function getOrderById(id: string) {
  return MOCK_ORDERS.find((o) => o.id === id) ?? null;
}
export async function getInsightsForOrder(orderId: string) {
  return MOCK_INSIGHTS.filter((insight) => insight.orderId === orderId);
}
export async function getMatches(userId: string) {
  return MOCK_MATCHES;
}
export async function getMatchById(id: string) {
  return MOCK_MATCHES.find((m) => m.id === id) ?? null;
}
export async function getInsiderProfile(userId: string) {
  return MOCK_INSIDER_PROFILE.find((p) => p.userId === userId);
}
export async function getTransactions() {
  return MOCK_TRANSACTIONS;
}
