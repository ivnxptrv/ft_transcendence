export type Role = 'client' | 'insider';

// -- Auth --
export type UserPayload = {
    userId: string;
    role: Role;
    name: string;
    // email: string;
}


// --- Shared ---
export type OrderStatus = 'pending' | 'has_responses' | 'completed'
export type MatchStatus = 'new' | 'responded' | 'purchased' | 'rated'

// --- Client ---
export type Order = {
    id: string; // or number? what are we using for DB?
    clientQuery: string; // clientOrder? 
    status: OrderStatus;
    createdAt: Date;
    responseCount: number
}

export type ResponseCard = {
    id: string;
    orderId: string;
    insiderLegend: string;
    price: number;
    credibilityScore: number;
    insiderInsight?: string;
    isUnlocked: boolean;
    // createdAt: Date;
}

// --- Insider ---

export type Match = {
    id: string; // better UUID
    clientQuery: string;
    insiderId: string;
    status: MatchStatus;
    matchScore: number;
    receivedAt: Date;
    yourPrice?: number;
    yourResponse?: string;
}

export type InsiderProfile = {
    userId: string;
    credibilityScore: number;
    totalEarnings: number;
    totalResponses: number;
    avgRating: number;
}
