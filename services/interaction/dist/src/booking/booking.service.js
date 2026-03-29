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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notification_service_1 = require("../notification/notification.service");
const config_1 = require("@nestjs/config");
const send_notification_dto_1 = require("../notification/dto/send-notification.dto");
const axios_1 = __importDefault(require("axios"));
let BookingService = class BookingService {
    prisma;
    notification;
    config;
    constructor(prisma, notification, config) {
        this.prisma = prisma;
        this.notification = notification;
        this.config = config;
    }
    async createSearchRequest(customerId, dto) {
        const windowMinutes = 30;
        const windowExpiresAt = new Date(Date.now() + windowMinutes * 60 * 1000);
        const searchRequest = await this.prisma.searchRequest.create({
            data: {
                customerId,
                query: dto.query,
                windowExpiresAt,
            },
        });
        const providers = await this.callSemanticSearch(dto.query, searchRequest.id, customerId, 10, 0);
        if (providers.length > 0) {
            await this.prisma.match.createMany({
                data: providers.map((p) => ({
                    searchRequestId: searchRequest.id,
                    providerId: p.providerId,
                    similarityScore: p.similarityScore,
                    batch: 1,
                })),
            });
            await this.prisma.searchRequest.update({
                where: { id: searchRequest.id },
                data: { totalNotified: providers.length },
            });
            await this.notification.sendMany({
                userIds: providers.map((p) => p.providerId),
                type: 'match_found',
                title: 'New Service Request',
                body: `A customer is looking for your services: "${dto.query.substring(0, 100)}"`,
                channel: send_notification_dto_1.NotificationChannel.websocket,
                data: { searchRequestId: searchRequest.id },
            });
        }
        this.scheduleWindowExpiry(searchRequest.id, windowMinutes);
        return {
            searchRequestId: searchRequest.id,
            windowExpiresAt,
            totalNotified: providers.length,
        };
    }
    async getSearchRequest(searchRequestId, customerId) {
        const searchRequest = await this.prisma.searchRequest.findUnique({
            where: { id: searchRequestId },
            include: {
                matches: {
                    where: { status: 'responded' },
                    orderBy: { similarityScore: 'desc' },
                },
            },
        });
        if (!searchRequest)
            throw new common_1.NotFoundException('Search request not found');
        if (searchRequest.customerId !== customerId)
            throw new common_1.ForbiddenException();
        return searchRequest;
    }
    async loadMoreProviders(searchRequestId, customerId) {
        const searchRequest = await this.prisma.searchRequest.findUnique({
            where: { id: searchRequestId },
            include: { matches: true },
        });
        if (!searchRequest)
            throw new common_1.NotFoundException('Search request not found');
        if (searchRequest.customerId !== customerId)
            throw new common_1.ForbiddenException();
        if (searchRequest.status !== 'active') {
            throw new common_1.BadRequestException('Search window is no longer active');
        }
        if (new Date() > searchRequest.windowExpiresAt) {
            throw new common_1.BadRequestException('Search window has expired');
        }
        const existingProviderIds = searchRequest.matches.map((m) => m.providerId);
        const currentBatch = Math.max(...searchRequest.matches.map((m) => m.batch), 0);
        const providers = await this.callSemanticSearch(searchRequest.query, searchRequestId, customerId, 10, existingProviderIds.length, existingProviderIds);
        if (providers.length === 0) {
            return { totalNotified: searchRequest.totalNotified, hasMore: false };
        }
        await this.prisma.match.createMany({
            data: providers.map((p) => ({
                searchRequestId,
                providerId: p.providerId,
                similarityScore: p.similarityScore,
                batch: currentBatch + 1,
            })),
        });
        await this.prisma.searchRequest.update({
            where: { id: searchRequestId },
            data: { totalNotified: { increment: providers.length } },
        });
        await this.notification.sendMany({
            userIds: providers.map((p) => p.providerId),
            type: 'match_found',
            title: 'New Service Request',
            body: `A customer is looking for your services: "${searchRequest.query.substring(0, 100)}"`,
            channel: send_notification_dto_1.NotificationChannel.websocket,
            data: { searchRequestId },
        });
        return {
            totalNotified: searchRequest.totalNotified + providers.length,
            hasMore: providers.length === 10,
        };
    }
    async getSearchHistory(customerId, params) {
        const { page, limit, status } = params;
        const skip = (page - 1) * limit;
        const where = { customerId };
        if (status)
            where.status = status;
        const [data, total] = await Promise.all([
            this.prisma.searchRequest.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { matches: true } } },
            }),
            this.prisma.searchRequest.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async respondToMatch(matchId, providerId, dto) {
        const match = await this.prisma.match.findUnique({
            where: { id: matchId },
            include: { searchRequest: true },
        });
        if (!match)
            throw new common_1.NotFoundException('Match not found');
        if (match.providerId !== providerId)
            throw new common_1.ForbiddenException();
        if (match.status !== 'notified') {
            throw new common_1.BadRequestException('Already responded to this match');
        }
        if (match.searchRequest.status !== 'active') {
            throw new common_1.BadRequestException('Search window is no longer active');
        }
        if (new Date() > match.searchRequest.windowExpiresAt) {
            throw new common_1.BadRequestException('Search window has expired');
        }
        if (!dto.accepted) {
            await this.prisma.match.update({
                where: { id: matchId },
                data: { status: 'rejected', respondedAt: new Date() },
            });
            return { matchId, status: 'rejected' };
        }
        const updatedMatch = await this.prisma.match.update({
            where: { id: matchId },
            data: {
                status: 'responded',
                responseMessage: dto.responseMessage,
                respondedAt: new Date(),
            },
        });
        await this.notification.send({
            userId: match.searchRequest.customerId,
            type: 'provider_responded',
            title: 'Provider Responded',
            body: dto.responseMessage ?? 'A provider has responded to your request',
            channel: send_notification_dto_1.NotificationChannel.websocket,
            data: { matchId, searchRequestId: match.searchRequestId },
        });
        this.notification.pushSseEvent(match.searchRequestId, 'provider_responded', {
            matchId,
            providerId,
            responseMessage: dto.responseMessage,
            similarityScore: match.similarityScore,
        });
        return { matchId, status: 'responded' };
    }
    async getPendingMatches(providerId) {
        return this.prisma.match.findMany({
            where: {
                providerId,
                status: 'notified',
                searchRequest: {
                    status: 'active',
                    windowExpiresAt: { gt: new Date() },
                },
            },
            include: { searchRequest: true },
            orderBy: { notifiedAt: 'desc' },
        });
    }
    async createBooking(customerId, dto) {
        const searchRequest = await this.prisma.searchRequest.findUnique({
            where: { id: dto.searchRequestId },
        });
        if (!searchRequest)
            throw new common_1.NotFoundException('Search request not found');
        if (searchRequest.customerId !== customerId)
            throw new common_1.ForbiddenException();
        if (searchRequest.status === 'booked') {
            throw new common_1.ConflictException('Search request already booked');
        }
        const match = await this.prisma.match.findUnique({
            where: { id: dto.matchId },
        });
        if (!match)
            throw new common_1.NotFoundException('Match not found');
        if (match.status !== 'responded') {
            throw new common_1.BadRequestException('Provider has not responded to this match');
        }
        await this.callLedgerLockFunds(customerId, match.providerId, dto.purchaseMinutes, dto.searchRequestId);
        const [booking] = await this.prisma.$transaction([
            this.prisma.booking.create({
                data: {
                    searchRequestId: dto.searchRequestId,
                    customerId,
                    providerId: match.providerId,
                    scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
                },
            }),
            this.prisma.searchRequest.update({
                where: { id: dto.searchRequestId },
                data: { status: 'booked' },
            }),
        ]);
        await this.notification.send({
            userId: match.providerId,
            type: 'booking_created',
            title: 'New Booking Request',
            body: 'A customer has booked your service. Please accept or reject.',
            channel: send_notification_dto_1.NotificationChannel.websocket,
            data: { bookingId: booking.id },
        });
        return booking;
    }
    async getBooking(bookingId, userId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { searchRequest: true, session: true },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.customerId !== userId && booking.providerId !== userId) {
            throw new common_1.ForbiddenException();
        }
        return booking;
    }
    async acceptBooking(bookingId, providerId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.providerId !== providerId)
            throw new common_1.ForbiddenException();
        if (booking.status !== 'pending') {
            throw new common_1.BadRequestException('Booking is not in pending status');
        }
        await this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'accepted' },
        });
        const session = await this.createSession(booking);
        await this.notification.send({
            userId: booking.customerId,
            type: 'booking_accepted',
            title: 'Booking Accepted',
            body: 'Your booking has been accepted. Your session is ready.',
            channel: send_notification_dto_1.NotificationChannel.websocket,
            data: { bookingId, sessionId: session.id },
        });
        return { bookingId, sessionId: session.id };
    }
    async rejectBooking(bookingId, providerId, reason) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.providerId !== providerId)
            throw new common_1.ForbiddenException();
        if (booking.status !== 'pending') {
            throw new common_1.BadRequestException('Booking is not in pending status');
        }
        await this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'rejected', cancelledBy: 'provider', cancellationReason: reason },
        });
        await this.callLedgerUnlockFunds(booking.customerId, booking.searchRequestId);
        await this.notification.send({
            userId: booking.customerId,
            type: 'booking_rejected',
            title: 'Booking Rejected',
            body: 'Your booking has been rejected. Your funds have been returned.',
            channel: send_notification_dto_1.NotificationChannel.websocket,
            data: { bookingId },
        });
        return { bookingId, status: 'rejected' };
    }
    async cancelBooking(bookingId, userId, dto) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.customerId !== userId && booking.providerId !== userId) {
            throw new common_1.ForbiddenException();
        }
        if (!['pending', 'accepted'].includes(booking.status)) {
            throw new common_1.BadRequestException('Cannot cancel booking in current status');
        }
        const cancelledBy = booking.customerId === userId ? 'customer' : 'provider';
        await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'cancelled',
                cancelledBy: cancelledBy,
                cancellationReason: dto.reason,
            },
        });
        await this.callLedgerUnlockFunds(booking.customerId, booking.searchRequestId);
        const notifyUserId = cancelledBy === 'customer' ? booking.providerId : booking.customerId;
        await this.notification.send({
            userId: notifyUserId,
            type: 'booking_cancelled',
            title: 'Booking Cancelled',
            body: 'A booking has been cancelled. Funds have been returned.',
            channel: send_notification_dto_1.NotificationChannel.websocket,
            data: { bookingId },
        });
        return { bookingId, status: 'cancelled' };
    }
    async getCustomerBookings(customerId, params) {
        const { page, limit, status } = params;
        const skip = (page - 1) * limit;
        const where = { customerId };
        if (status)
            where.status = status;
        const [data, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { session: true },
            }),
            this.prisma.booking.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getProviderBookings(providerId, params) {
        const { page, limit, status } = params;
        const skip = (page - 1) * limit;
        const where = { providerId };
        if (status)
            where.status = status;
        const [data, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { session: true },
            }),
            this.prisma.booking.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getAllBookings(params) {
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
            this.prisma.booking.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { session: true },
            }),
            this.prisma.booking.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getAllSearchRequests(params) {
        const { page, limit, status } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        const [data, total] = await Promise.all([
            this.prisma.searchRequest.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { matches: true } } },
            }),
            this.prisma.searchRequest.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async markCompleted(bookingId) {
        return this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'completed' },
        });
    }
    async markRefunded(bookingId) {
        return this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'refunded' },
        });
    }
    async createSession(booking) {
        const providerProfile = await this.callIdentityGetProvider(booking.providerId);
        const hourlyRate = providerProfile?.hourlyRate ?? 500;
        return this.prisma.session.create({
            data: {
                bookingId: booking.id,
                customerId: booking.customerId,
                providerId: booking.providerId,
                hourlyRate,
                purchasedMinutes: 60,
                totalMinutes: 60,
            },
        });
    }
    scheduleWindowExpiry(searchRequestId, minutes) {
        setTimeout(async () => {
            const sr = await this.prisma.searchRequest.findUnique({
                where: { id: searchRequestId },
                include: { _count: { select: { matches: { where: { status: 'responded' } } } } },
            });
            if (!sr || sr.status !== 'active')
                return;
            await this.prisma.searchRequest.update({
                where: { id: searchRequestId },
                data: { status: 'expired' },
            });
            await this.prisma.match.updateMany({
                where: { searchRequestId, status: 'notified' },
                data: { status: 'ignored' },
            });
            if (sr._count.matches === 0) {
                await this.notification.send({
                    userId: sr.customerId,
                    type: 'match_no_response',
                    title: 'No Providers Responded',
                    body: 'Unfortunately no providers responded to your request. Please try again.',
                    channel: send_notification_dto_1.NotificationChannel.websocket,
                    data: { searchRequestId },
                });
                this.notification.pushSseEvent(searchRequestId, 'no_response', { searchRequestId });
            }
            else {
                this.notification.pushSseEvent(searchRequestId, 'window_expired', {
                    searchRequestId,
                    totalResponses: sr._count.matches,
                });
            }
        }, minutes * 60 * 1000);
    }
    async callSemanticSearch(query, searchRequestId, customerId, limit, offset, excludeProviderIds = []) {
        try {
            const res = await axios_1.default.post(`${this.config.get('SEMANTIC_SERVICE_URL')}/search`, { query, searchRequestId, customerId, limit, offset, excludeProviderIds });
            return res.data.results ?? [];
        }
        catch (err) {
            console.error('Semantic search failed:', err.message);
            return [];
        }
    }
    async callLedgerLockFunds(customerId, providerId, minutes, referenceId) {
        try {
            await axios_1.default.post(`${this.config.get('LEDGER_SERVICE_URL')}/internal/wallet/lock`, {
                userId: customerId,
                amount: minutes,
                referenceId,
            });
        }
        catch (err) {
            console.error('Failed to lock funds:', err.message);
        }
    }
    async callLedgerUnlockFunds(customerId, referenceId) {
        try {
            await axios_1.default.post(`${this.config.get('LEDGER_SERVICE_URL')}/internal/wallet/unlock`, {
                userId: customerId,
                referenceId,
            });
        }
        catch (err) {
            console.error('Failed to unlock funds:', err.message);
        }
    }
    async callIdentityGetProvider(providerId) {
        try {
            const res = await axios_1.default.get(`${this.config.get('IDENTITY_SERVICE_URL')}/internal/users/${providerId}/basic`);
            return res.data;
        }
        catch (err) {
            console.error('Failed to get provider info:', err.message);
            return null;
        }
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService,
        config_1.ConfigService])
], BookingService);
//# sourceMappingURL=booking.service.js.map