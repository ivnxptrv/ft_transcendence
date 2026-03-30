import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private userSockets;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleMarkRead(client: Socket, data: {
        notificationId: string;
    }): void;
    sendToUser(userId: string, event: string, data: any): void;
    sendToAll(event: string, data: any): void;
    isUserOnline(userId: string): boolean;
}
