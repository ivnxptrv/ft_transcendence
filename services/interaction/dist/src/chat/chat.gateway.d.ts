import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleMessage(client: Socket, data: {
        sessionId: string;
        content?: string;
        type?: string;
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
    }): Promise<void>;
    handleMarkRead(client: Socket, data: {
        sessionId: string;
        messageId: string;
    }): Promise<void>;
    handleTyping(client: Socket, data: {
        sessionId: string;
    }): void;
    emitToSession(sessionId: string, event: string, data: any): void;
    emitTick(sessionId: string, timeRemaining: number): void;
}
