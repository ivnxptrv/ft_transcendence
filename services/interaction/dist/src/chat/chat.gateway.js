"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
let ChatGateway = class ChatGateway {
    chatService;
    server;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async handleConnection(client) {
        const userId = client.handshake.query['userId'];
        const sessionId = client.handshake.query['sessionId'];
        if (!userId || !sessionId) {
            client.disconnect();
            return;
        }
        client.join(`session:${sessionId}`);
        client.data.userId = userId;
        client.data.sessionId = sessionId;
        await this.chatService.handleUserConnected(sessionId, userId);
        client.emit('session_joined', { sessionId });
    }
    async handleDisconnect(client) {
        const { userId, sessionId } = client.data;
        if (userId && sessionId) {
            await this.chatService.handleUserDisconnected(sessionId, userId);
        }
    }
    async handleMessage(client, data) {
        const message = await this.chatService.saveMessage({
            sessionId: data.sessionId,
            senderId: client.data.userId,
            content: data.content,
            type: data.type ?? 'text',
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileSize: data.fileSize,
        });
        this.server.to(`session:${data.sessionId}`).emit('new_message', message);
    }
    async handleMarkRead(client, data) {
        await this.chatService.markMessageRead(data.messageId);
        client.emit('marked_read', { messageId: data.messageId });
    }
    handleTyping(client, data) {
        client.to(`session:${data.sessionId}`).emit('typing', {
            senderId: client.data.userId,
        });
    }
    emitToSession(sessionId, event, data) {
        this.server.to(`session:${sessionId}`).emit(event, data);
    }
    emitTick(sessionId, timeRemaining) {
        this.server.to(`session:${sessionId}`).emit('tick', { timeRemaining });
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/chat',
        cors: { origin: '*', credentials: true },
    }),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => chat_service_1.ChatService))),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map