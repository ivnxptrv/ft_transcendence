import { NotificationChannel, NotificationSeverity } from './send-notification.dto';
export declare class SendManyNotificationDto {
    userIds: string[];
    type: string;
    title: string;
    body: string;
    channel: NotificationChannel;
    severity?: NotificationSeverity;
    data?: Record<string, any>;
}
