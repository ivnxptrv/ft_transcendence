import { ChatService } from './chat.service';
import { ExtendSessionDto } from './dto/extend-session.dto';
import type { Request } from 'express';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getSession(sessionId: string, req: Request): Promise<{
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
    extendSession(sessionId: string, req: Request, dto: ExtendSessionDto): Promise<{
        sessionId: string;
        addedMinutes: number;
        totalMinutes: number;
        cost: number;
        timeRemaining: number;
    }>;
    pauseSession(sessionId: string, req: Request): Promise<{
        sessionId: string;
        status: string;
        timeRemaining: number;
    }>;
    resumeSession(sessionId: string, req: Request): Promise<{
        sessionId: string;
        status: string;
        timeRemaining: number;
    }>;
    endSessionSatisfied(sessionId: string, req: Request): Promise<{
        sessionId: string;
        status: string;
        totalCost: number;
        providerEarning: number;
        platformFee: number;
        refundAmount: number;
    }>;
    getMessages(sessionId: string, req: Request, page?: string, limit?: string, before?: string): Promise<{
        data: {
            type: import(".prisma/client").$Enums.MessageType;
            id: string;
            isRead: boolean;
            createdAt: Date;
            sessionId: string;
            senderId: string;
            senderRole: import(".prisma/client").$Enums.MessageSenderRole;
            content: string | null;
            fileUrl: string | null;
            fileName: string | null;
            fileSize: number | null;
        }[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
    }>;
    getCustomerSessions(req: Request, page?: string, limit?: string, status?: string): Promise<{
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
    getProviderSessions(req: Request, page?: string, limit?: string, status?: string): Promise<{
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
}
