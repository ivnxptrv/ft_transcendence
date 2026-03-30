import { ChatService } from './chat.service';
export declare class ChatAdminController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getAllSessions(page?: string, limit?: string, status?: string, customerId?: string, providerId?: string): Promise<{
        data: ({
            extensions: {
                id: string;
                createdAt: Date;
                sessionId: string;
                minutes: number;
                cost: import("@prisma/client-runtime-utils").Decimal;
            }[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.SessionStatus;
            createdAt: Date;
            customerId: string;
            updatedAt: Date;
            providerId: string;
            bookingId: string;
            hourlyRate: import("@prisma/client-runtime-utils").Decimal;
            purchasedMinutes: number;
            totalMinutes: number;
            timeRemaining: number | null;
            startedAt: Date | null;
            pausedAt: Date | null;
            endedAt: Date | null;
            totalCost: import("@prisma/client-runtime-utils").Decimal | null;
            providerEarning: import("@prisma/client-runtime-utils").Decimal | null;
            platformFee: import("@prisma/client-runtime-utils").Decimal | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getActiveSessions(): Promise<{
        timeRemaining: number | null;
        extensions: {
            id: string;
            createdAt: Date;
            sessionId: string;
            minutes: number;
            cost: import("@prisma/client-runtime-utils").Decimal;
        }[];
        id: string;
        status: import(".prisma/client").$Enums.SessionStatus;
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
    }[]>;
    forceEndSession(sessionId: string, body: {
        reason?: string;
    }): Promise<{
        sessionId: string;
        status: string;
        totalCost: number;
        providerEarning: number;
        platformFee: number;
        refundAmount: number;
    }>;
}
