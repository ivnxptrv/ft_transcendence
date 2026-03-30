export declare enum NotificationChannel {
    in_app = "in_app",
    sse = "sse",
    websocket = "websocket"
}
export declare enum NotificationSeverity {
    info = "info",
    warning = "warning",
    critical = "critical"
}
export declare class SendNotificationDto {
    userId: string;
    type: string;
    title: string;
    body: string;
    channel: NotificationChannel;
    severity?: NotificationSeverity;
    data?: Record<string, any>;
    referenceId?: string;
    referenceType?: string;
}
