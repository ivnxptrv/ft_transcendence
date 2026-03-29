import { ChatService } from './chat.service';
export declare class ChatInternalController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createSession(body: {
        bookingId: string;
        customerId: string;
        providerId: string;
        hourlyRate: number;
        purchasedMinutes: number;
    }): Promise<{
        sessionId: string;
    }>;
    getSession(sessionId: string): Promise<{
        timeRemaining: number | null;
        status: string;
        extensions: {
            id: string;
            createdAt: Date;
            sessionId: string;
            minutes: number;
            cost: import("@prisma/client-runtime-utils").Decimal;
        }[];
        id: string;
        createdAt: Date;
        customerId: string;
        updatedAt: Date;
        providerId: string;
        bookingId: string;
        hourlyRate: import("@prisma/client-runtime-utils").Decimal;
        purchasedMinutes: number;
        totalMinutes: number;
        startedAt: Date | null;
        pausedAt: Date | null;
        endedAt: Date | null;
        totalCost: import("@prisma/client-runtime-utils").Decimal | null;
        providerEarning: import("@prisma/client-runtime-utils").Decimal | null;
        platformFee: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
}
