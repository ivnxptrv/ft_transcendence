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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notification_gateway_1 = require("./notification.gateway");
let NotificationService = class NotificationService {
    prisma;
    gateway;
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async send(dto) {
        const notification = await this.prisma.notification.create({
            data: {
                userId: dto.userId,
                type: dto.type,
                channel: dto.channel,
                severity: dto.severity ?? 'info',
                title: dto.title,
                body: dto.body,
                data: dto.data ?? undefined,
                referenceId: dto.referenceId,
                referenceType: dto.referenceType,
                status: 'sent',
                sentAt: new Date(),
            },
        });
        if (dto.channel === 'websocket' || dto.channel === 'in_app') {
            this.gateway.sendToUser(dto.userId, 'notification', notification);
        }
        return notification;
    }
    async sendMany(dto) {
        const notifications = await this.prisma.notification.createMany({
            data: dto.userIds.map((userId) => ({
                userId,
                type: dto.type,
                channel: dto.channel,
                severity: dto.severity ?? 'info',
                title: dto.title,
                body: dto.body,
                data: dto.data ?? undefined,
                status: 'sent',
                sentAt: new Date(),
            })),
        });
        if (dto.channel === 'websocket' || dto.channel === 'in_app') {
            for (const userId of dto.userIds) {
                this.gateway.sendToUser(userId, 'notification', {
                    type: dto.type,
                    title: dto.title,
                    body: dto.body,
                });
            }
        }
        return { sentCount: notifications.count };
    }
    async getUserNotifications(userId, params) {
        const { page, limit, isRead, severity } = params;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (isRead !== undefined)
            where.isRead = isRead;
        if (severity)
            where.severity = severity;
        const [data, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);
        return {
            data,
            total,
            unreadCount,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getUnreadCount(userId) {
        const count = await this.prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { count };
    }
    async markRead(notificationId, userId) {
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async markAllRead(userId) {
        const result = await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
        return { updatedCount: result.count };
    }
    async deleteNotification(notificationId, userId) {
        return this.prisma.notification.delete({
            where: { id: notificationId },
        });
    }
    async getAll(params) {
        const { page, limit, userId, type, severity, status } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (userId)
            where.userId = userId;
        if (type)
            where.type = type;
        if (severity)
            where.severity = severity;
        if (status)
            where.status = status;
        const [data, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async broadcast(params) {
        this.gateway.sendToAll('notification', {
            type: 'admin_broadcast',
            title: params.title,
            body: params.body,
            severity: params.severity ?? 'info',
        });
        return { message: 'Broadcast sent' };
    }
    sseClients = new Map();
    registerSseClient(searchRequestId, client) {
        if (!this.sseClients.has(searchRequestId)) {
            this.sseClients.set(searchRequestId, new Set());
        }
        this.sseClients.get(searchRequestId).add(client);
    }
    removeSseClient(searchRequestId, client) {
        this.sseClients.get(searchRequestId)?.delete(client);
    }
    pushSseEvent(searchRequestId, event, data) {
        const clients = this.sseClients.get(searchRequestId);
        if (!clients)
            return 0;
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const client of clients) {
            client.res.write(payload);
        }
        return clients.size;
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_gateway_1.NotificationGateway])
], NotificationService);
//# sourceMappingURL=notification.service.js.map