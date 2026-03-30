import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';
import { SendNotificationDto } from './dto/send-notification.dto';
import { SendManyNotificationDto } from './dto/send-many.dto';
export declare class NotificationService {
    private readonly prisma;
    private readonly gateway;
    constructor(prisma: PrismaService, gateway: NotificationGateway);
    send(dto: SendNotificationDto): Promise<{
        userId: string | null;
        type: string;
        title: string;
        body: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        severity: import(".prisma/client").$Enums.NotificationSeverity;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        referenceId: string | null;
        referenceType: string | null;
        id: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        audience: import(".prisma/client").$Enums.NotificationAudience;
        isRead: boolean;
        isBatched: boolean;
        batchCount: number;
        sentAt: Date | null;
        readAt: Date | null;
        createdAt: Date;
    }>;
    sendMany(dto: SendManyNotificationDto): Promise<{
        sentCount: number;
    }>;
    getUserNotifications(userId: string, params: {
        page: number;
        limit: number;
        isRead?: boolean;
        severity?: string;
    }): Promise<{
        data: {
            userId: string | null;
            type: string;
            title: string;
            body: string;
            channel: import(".prisma/client").$Enums.NotificationChannel;
            severity: import(".prisma/client").$Enums.NotificationSeverity;
            data: import("@prisma/client/runtime/client").JsonValue | null;
            referenceId: string | null;
            referenceType: string | null;
            id: string;
            status: import(".prisma/client").$Enums.NotificationStatus;
            audience: import(".prisma/client").$Enums.NotificationAudience;
            isRead: boolean;
            isBatched: boolean;
            batchCount: number;
            sentAt: Date | null;
            readAt: Date | null;
            createdAt: Date;
        }[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markRead(notificationId: string, userId: string): Promise<{
        userId: string | null;
        type: string;
        title: string;
        body: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        severity: import(".prisma/client").$Enums.NotificationSeverity;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        referenceId: string | null;
        referenceType: string | null;
        id: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        audience: import(".prisma/client").$Enums.NotificationAudience;
        isRead: boolean;
        isBatched: boolean;
        batchCount: number;
        sentAt: Date | null;
        readAt: Date | null;
        createdAt: Date;
    }>;
    markAllRead(userId: string): Promise<{
        updatedCount: number;
    }>;
    deleteNotification(notificationId: string, userId: string): Promise<{
        userId: string | null;
        type: string;
        title: string;
        body: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        severity: import(".prisma/client").$Enums.NotificationSeverity;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        referenceId: string | null;
        referenceType: string | null;
        id: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        audience: import(".prisma/client").$Enums.NotificationAudience;
        isRead: boolean;
        isBatched: boolean;
        batchCount: number;
        sentAt: Date | null;
        readAt: Date | null;
        createdAt: Date;
    }>;
    getAll(params: {
        page: number;
        limit: number;
        userId?: string;
        type?: string;
        severity?: string;
        status?: string;
    }): Promise<{
        data: {
            userId: string | null;
            type: string;
            title: string;
            body: string;
            channel: import(".prisma/client").$Enums.NotificationChannel;
            severity: import(".prisma/client").$Enums.NotificationSeverity;
            data: import("@prisma/client/runtime/client").JsonValue | null;
            referenceId: string | null;
            referenceType: string | null;
            id: string;
            status: import(".prisma/client").$Enums.NotificationStatus;
            audience: import(".prisma/client").$Enums.NotificationAudience;
            isRead: boolean;
            isBatched: boolean;
            batchCount: number;
            sentAt: Date | null;
            readAt: Date | null;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    broadcast(params: {
        title: string;
        body: string;
        audience: string;
        severity?: string;
    }): Promise<{
        message: string;
    }>;
    private sseClients;
    registerSseClient(searchRequestId: string, client: any): void;
    removeSseClient(searchRequestId: string, client: any): void;
    pushSseEvent(searchRequestId: string, event: string, data: any): number;
}
