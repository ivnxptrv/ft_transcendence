import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { ChatGateway } from './chat.gateway';
import { ConfigService } from '@nestjs/config';
import { ExtendSessionDto } from './dto/extend-session.dto';
export declare class ChatService {
    private readonly prisma;
    private readonly notification;
    private readonly config;
    private readonly gateway;
    private sessionTimers;
    private sessionState;
    constructor(prisma: PrismaService, notification: NotificationService, config: ConfigService, gateway: ChatGateway);
    getSession(sessionId: string, userId: string): Promise<{
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
    extendSession(sessionId: string, userId: string, dto: ExtendSessionDto): Promise<{
        sessionId: string;
        addedMinutes: number;
        totalMinutes: number;
        cost: number;
        timeRemaining: number;
    }>;
    pauseSession(sessionId: string, userId: string): Promise<{
        sessionId: string;
        status: string;
        timeRemaining: number;
    }>;
    resumeSession(sessionId: string, userId: string): Promise<{
        sessionId: string;
        status: string;
        timeRemaining: number;
    }>;
    endSessionSatisfied(sessionId: string, userId: string): Promise<{
        sessionId: string;
        status: string;
        totalCost: number;
        providerEarning: number;
        platformFee: number;
        refundAmount: number;
    }>;
    getSessionHistory(userId: string, role: 'customer' | 'provider', params: {
        page: number;
        limit: number;
        status?: string;
    }): Promise<{
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
    getMessages(sessionId: string, userId: string, params: {
        page: number;
        limit: number;
        before?: string;
    }): Promise<{
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
    saveMessage(data: {
        sessionId: string;
        senderId: string;
        content?: string;
        type: 'text' | 'file' | 'system';
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
    }): Promise<{
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
    }>;
    markMessageRead(messageId: string): Promise<{
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
    }>;
    handleUserConnected(sessionId: string, userId: string): Promise<void>;
    handleUserDisconnected(sessionId: string, userId: string): Promise<void>;
    getAllSessions(params: {
        page: number;
        limit: number;
        status?: string;
        customerId?: string;
        providerId?: string;
    }): Promise<{
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
    forceEndSession(sessionId: string, reason?: string): Promise<{
        sessionId: string;
        status: string;
        totalCost: number;
        providerEarning: number;
        platformFee: number;
        refundAmount: number;
    }>;
    createSession(data: {
        bookingId: string;
        customerId: string;
        providerId: string;
        hourlyRate: number;
        purchasedMinutes: number;
    }): Promise<{
        sessionId: string;
    }>;
    getSessionById(sessionId: string): Promise<{
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
    private startTimer;
    private stopTimer;
    private finalizeSession;
    private addSystemMessage;
    private callLedgerExtend;
    private callLedgerTransfer;
    private callLedgerTriggerReview;
}
