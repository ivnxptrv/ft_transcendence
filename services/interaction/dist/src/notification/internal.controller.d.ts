import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { SendManyNotificationDto } from './dto/send-many.dto';
export declare class NotificationInternalController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
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
    pushSse(body: {
        searchRequestId: string;
        event: string;
        data: any;
    }): Promise<{
        pushedTo: number;
    }>;
}
