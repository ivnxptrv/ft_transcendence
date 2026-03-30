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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notification_service_1 = require("../notification/notification.service");
const chat_gateway_1 = require("./chat.gateway");
const config_1 = require("@nestjs/config");
const send_notification_dto_1 = require("../notification/dto/send-notification.dto");
const axios_1 = __importDefault(require("axios"));
const common_2 = require("@nestjs/common");
let ChatService = class ChatService {
    prisma;
    notification;
    config;
    gateway;
    sessionTimers = new Map();
    sessionState = new Map();
    constructor(prisma, notification, config, gateway) {
        this.prisma = prisma;
        this.notification = notification;
        this.config = config;
        this.gateway = gateway;
    }
    async getSession(sessionId, userId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { extensions: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.customerId !== userId && session.providerId !== userId) {
            throw new common_1.ForbiddenException();
        }
        const liveState = this.sessionState.get(sessionId);
        return {
            ...session,
            timeRemaining: liveState?.timeRemaining ?? session.timeRemaining,
            status: liveState?.status ?? session.status,
        };
    }
    async extendSession(sessionId, userId, dto) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.customerId !== userId) {
            throw new common_1.ForbiddenException('Only customer can extend session');
        }
        const state = this.sessionState.get(sessionId);
        if (!state || state.status !== 'active') {
            throw new common_1.BadRequestException('Session is not active');
        }
        const cost = Math.round((Number(session.hourlyRate) / 60) * dto.minutes);
        await this.callLedgerExtend(userId, cost, sessionId);
        await this.prisma.sessionExtension.create({
            data: { sessionId, minutes: dto.minutes, cost },
        });
        await this.prisma.session.update({
            where: { id: sessionId },
            data: { totalMinutes: { increment: dto.minutes } },
        });
        const newTimeRemaining = (state.timeRemaining ?? 0) + dto.minutes * 60;
        this.sessionState.set(sessionId, { ...state, timeRemaining: newTimeRemaining });
        this.gateway.emitToSession(sessionId, 'session_extended', {
            sessionId,
            addedMinutes: dto.minutes,
            timeRemaining: newTimeRemaining,
        });
        return {
            sessionId,
            addedMinutes: dto.minutes,
            totalMinutes: session.totalMinutes + dto.minutes,
            cost,
            timeRemaining: newTimeRemaining,
        };
    }
    async pauseSession(sessionId, userId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.providerId !== userId) {
            throw new common_1.ForbiddenException('Only provider can pause session');
        }
        const state = this.sessionState.get(sessionId);
        if (!state || state.status !== 'active') {
            throw new common_1.BadRequestException('Session is not active');
        }
        this.stopTimer(sessionId);
        this.sessionState.set(sessionId, { ...state, status: 'paused' });
        await this.prisma.session.update({
            where: { id: sessionId },
            data: { status: 'paused', pausedAt: new Date() },
        });
        this.gateway.emitToSession(sessionId, 'session_paused', { sessionId });
        return { sessionId, status: 'paused', timeRemaining: state.timeRemaining };
    }
    async resumeSession(sessionId, userId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.providerId !== userId) {
            throw new common_1.ForbiddenException('Only provider can resume session');
        }
        const state = this.sessionState.get(sessionId);
        if (!state || state.status !== 'paused') {
            throw new common_1.BadRequestException('Session is not paused');
        }
        this.sessionState.set(sessionId, { ...state, status: 'active' });
        this.startTimer(sessionId);
        await this.prisma.session.update({
            where: { id: sessionId },
            data: { status: 'active', pausedAt: null },
        });
        this.gateway.emitToSession(sessionId, 'session_resumed', {
            sessionId,
            timeRemaining: state.timeRemaining,
        });
        return { sessionId, status: 'active', timeRemaining: state.timeRemaining };
    }
    async endSessionSatisfied(sessionId, userId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.customerId !== userId) {
            throw new common_1.ForbiddenException('Only customer can end session as satisfied');
        }
        const state = this.sessionState.get(sessionId);
        if (!state || !['active', 'paused'].includes(state.status)) {
            throw new common_1.BadRequestException('Session is not active');
        }
        return this.finalizeSession(sessionId, 'ended_satisfied', state.timeRemaining ?? 0);
    }
    async getSessionHistory(userId, role, params) {
        const { page, limit, status } = params;
        const skip = (page - 1) * limit;
        const where = role === 'customer' ? { customerId: userId } : { providerId: userId };
        if (status)
            where.status = status;
        const [data, total] = await Promise.all([
            this.prisma.session.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { extensions: true },
            }),
            this.prisma.session.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getMessages(sessionId, userId, params) {
        const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.customerId !== userId && session.providerId !== userId) {
            throw new common_1.ForbiddenException();
        }
        const { page, limit, before } = params;
        const skip = (page - 1) * limit;
        const where = { sessionId };
        if (before)
            where.createdAt = { lt: new Date(before) };
        const [data, total] = await Promise.all([
            this.prisma.message.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'asc' },
            }),
            this.prisma.message.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            hasMore: skip + data.length < total,
        };
    }
    async saveMessage(data) {
        const session = await this.prisma.session.findUnique({
            where: { id: data.sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        const senderRole = data.senderId === session.customerId
            ? 'customer'
            : data.senderId === session.providerId
                ? 'provider'
                : 'system';
        return this.prisma.message.create({
            data: {
                sessionId: data.sessionId,
                senderId: data.senderId,
                senderRole: senderRole,
                type: data.type,
                content: data.content,
                fileUrl: data.fileUrl,
                fileName: data.fileName,
                fileSize: data.fileSize,
            },
        });
    }
    async markMessageRead(messageId) {
        return this.prisma.message.update({
            where: { id: messageId },
            data: { isRead: true },
        });
    }
    async handleUserConnected(sessionId, userId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            return;
        if (session.status === 'pending') {
            await this.prisma.session.update({
                where: { id: sessionId },
                data: { status: 'active', startedAt: new Date() },
            });
            const timeRemaining = session.purchasedMinutes * 60;
            this.sessionState.set(sessionId, { timeRemaining, status: 'active' });
            this.startTimer(sessionId);
            this.gateway.emitToSession(sessionId, 'session_active', { sessionId });
            await this.addSystemMessage(sessionId, `Session started — ${session.purchasedMinutes} minutes purchased`);
        }
        const role = userId === session.customerId ? 'customer' : 'provider';
        this.gateway.emitToSession(sessionId, 'partner_reconnected', { userId, role });
    }
    async handleUserDisconnected(sessionId, userId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            return;
        const role = userId === session.customerId ? 'customer' : 'provider';
        this.gateway.emitToSession(sessionId, 'partner_disconnected', { userId, role });
    }
    async getAllSessions(params) {
        const { page, limit, status, customerId, providerId } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (customerId)
            where.customerId = customerId;
        if (providerId)
            where.providerId = providerId;
        const [data, total] = await Promise.all([
            this.prisma.session.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { extensions: true },
            }),
            this.prisma.session.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getActiveSessions() {
        const sessions = await this.prisma.session.findMany({
            where: { status: { in: ['active', 'paused'] } },
            include: { extensions: true },
        });
        return sessions.map((s) => ({
            ...s,
            timeRemaining: this.sessionState.get(s.id)?.timeRemaining ?? s.timeRemaining,
        }));
    }
    async forceEndSession(sessionId, reason) {
        const state = this.sessionState.get(sessionId);
        return this.finalizeSession(sessionId, 'ended_forced', state?.timeRemaining ?? 0);
    }
    async createSession(data) {
        const session = await this.prisma.session.create({
            data: {
                bookingId: data.bookingId,
                customerId: data.customerId,
                providerId: data.providerId,
                hourlyRate: data.hourlyRate,
                purchasedMinutes: data.purchasedMinutes,
                totalMinutes: data.purchasedMinutes,
            },
        });
        return { sessionId: session.id };
    }
    async getSessionById(sessionId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { extensions: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        const liveState = this.sessionState.get(sessionId);
        return {
            ...session,
            timeRemaining: liveState?.timeRemaining ?? session.timeRemaining,
            status: liveState?.status ?? session.status,
        };
    }
    startTimer(sessionId) {
        const timer = setInterval(async () => {
            const state = this.sessionState.get(sessionId);
            if (!state || state.status !== 'active')
                return;
            const newTime = state.timeRemaining - 1;
            this.sessionState.set(sessionId, { ...state, timeRemaining: newTime });
            this.gateway.emitTick(sessionId, newTime);
            if (newTime === 300) {
                this.gateway.emitToSession(sessionId, 'session_warning', {
                    sessionId,
                    timeRemaining: newTime,
                });
            }
            if (newTime <= 0) {
                this.stopTimer(sessionId);
                await this.finalizeSession(sessionId, 'ended_timeout', 0);
            }
        }, 1000);
        this.sessionTimers.set(sessionId, timer);
    }
    stopTimer(sessionId) {
        const timer = this.sessionTimers.get(sessionId);
        if (timer) {
            clearInterval(timer);
            this.sessionTimers.delete(sessionId);
        }
    }
    async finalizeSession(sessionId, endStatus, timeRemaining) {
        this.stopTimer(sessionId);
        this.sessionState.delete(sessionId);
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        const minutesUsed = session.totalMinutes - Math.floor(timeRemaining / 60);
        const totalCost = Math.round((Number(session.hourlyRate) / 60) * minutesUsed);
        const providerEarning = Math.round(totalCost * 0.95);
        const platformFee = totalCost - providerEarning;
        const refundAmount = Math.round((Number(session.hourlyRate) / 60) * Math.floor(timeRemaining / 60));
        await this.prisma.session.update({
            where: { id: sessionId },
            data: {
                status: endStatus,
                endedAt: new Date(),
                timeRemaining,
                totalCost,
                providerEarning,
                platformFee,
            },
        });
        await this.prisma.booking.update({
            where: { id: session.bookingId },
            data: { status: endStatus === 'ended_forced' ? 'completed' : 'completed' },
        });
        await this.callLedgerTransfer(session.customerId, session.providerId, totalCost, sessionId, refundAmount);
        await this.callLedgerTriggerReview(sessionId, session.customerId, session.providerId);
        const summary = { sessionId, status: endStatus, totalCost, providerEarning, platformFee, refundAmount };
        this.gateway.emitToSession(sessionId, 'session_ended', summary);
        await this.notification.send({
            userId: session.customerId,
            type: 'session_ended',
            title: 'Session Ended',
            body: `Your session has ended. Total cost: ${totalCost} pts.`,
            channel: send_notification_dto_1.NotificationChannel.websocket,
            data: summary,
        });
        await this.notification.send({
            userId: session.providerId,
            type: 'session_ended',
            title: 'Session Ended',
            body: `Session completed. You earned ${providerEarning} pts.`,
            channel: send_notification_dto_1.NotificationChannel.websocket,
            data: summary,
        });
        return summary;
    }
    async addSystemMessage(sessionId, content) {
        return this.prisma.message.create({
            data: {
                sessionId,
                senderId: 'system',
                senderRole: 'system',
                type: 'system',
                content,
            },
        });
    }
    async callLedgerExtend(userId, amount, sessionId) {
        try {
            await axios_1.default.post(`${this.config.get('LEDGER_SERVICE_URL')}/internal/wallet/extend`, {
                userId,
                amount,
                sessionId,
            });
        }
        catch (err) {
            console.error('Failed to extend payment:', err.message);
        }
    }
    async callLedgerTransfer(customerId, providerId, totalAmount, sessionId, refundAmount) {
        try {
            await axios_1.default.post(`${this.config.get('LEDGER_SERVICE_URL')}/internal/wallet/transfer`, {
                customerId,
                providerId,
                totalAmount,
                sessionId,
                refundAmount,
            });
        }
        catch (err) {
            console.error('Failed to transfer funds:', err.message);
        }
    }
    async callLedgerTriggerReview(sessionId, customerId, providerId) {
        try {
            await axios_1.default.post(`${this.config.get('LEDGER_SERVICE_URL')}/internal/reviews/prompt`, {
                sessionId,
                customerId,
                providerId,
            });
        }
        catch (err) {
            console.error('Failed to trigger review:', err.message);
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_2.Inject)((0, common_2.forwardRef)(() => chat_gateway_1.ChatGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService,
        config_1.ConfigService,
        chat_gateway_1.ChatGateway])
], ChatService);
//# sourceMappingURL=chat.service.js.map