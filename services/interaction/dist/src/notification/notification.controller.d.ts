import { NotificationService } from './notification.service';
import type { Request, Response } from 'express';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(req: Request, page?: string, limit?: string, isRead?: string, severity?: string): Promise<{
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
    getUnreadCount(req: Request): Promise<{
        count: number;
    }>;
    markRead(id: string, req: Request): Promise<{
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
    markAllRead(req: Request): Promise<{
        updatedCount: number;
    }>;
    deleteNotification(id: string, req: Request): Promise<{
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
    searchSse(searchRequestId: string, req: Request, res: Response): Promise<void>;
    liveSse(req: Request, res: Response): Promise<void>;
}
