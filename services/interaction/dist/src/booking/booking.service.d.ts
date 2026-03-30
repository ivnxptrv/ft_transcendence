import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { ConfigService } from '@nestjs/config';
import { CreateSearchRequestDto } from './dto/create-search-request.dto';
import { RespondMatchDto } from './dto/respond-match.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
export declare class BookingService {
    private readonly prisma;
    private readonly notification;
    private readonly config;
    constructor(prisma: PrismaService, notification: NotificationService, config: ConfigService);
    createSearchRequest(customerId: string, dto: CreateSearchRequestDto): Promise<{
        searchRequestId: string;
        windowExpiresAt: Date;
        totalNotified: any;
    }>;
    getSearchRequest(searchRequestId: string, customerId: string): Promise<{
        matches: {
            id: string;
            status: import(".prisma/client").$Enums.MatchStatus;
            createdAt: Date;
            searchRequestId: string;
            responseMessage: string | null;
            updatedAt: Date;
            similarityScore: import("@prisma/client-runtime-utils").Decimal;
            providerId: string;
            batch: number;
            respondedAt: Date | null;
            notifiedAt: Date;
        }[];
    } & {
        query: string;
        id: string;
        status: import(".prisma/client").$Enums.SearchRequestStatus;
        createdAt: Date;
        customerId: string;
        windowExpiresAt: Date;
        totalNotified: number;
        updatedAt: Date;
    }>;
    loadMoreProviders(searchRequestId: string, customerId: string): Promise<{
        totalNotified: any;
        hasMore: boolean;
    }>;
    getSearchHistory(customerId: string, params: {
        page: number;
        limit: number;
        status?: string;
    }): Promise<{
        data: ({
            _count: {
                matches: number;
            };
        } & {
            query: string;
            id: string;
            status: import(".prisma/client").$Enums.SearchRequestStatus;
            createdAt: Date;
            customerId: string;
            windowExpiresAt: Date;
            totalNotified: number;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    respondToMatch(matchId: string, providerId: string, dto: RespondMatchDto): Promise<{
        matchId: string;
        status: string;
    }>;
    getPendingMatches(providerId: string): Promise<({
        searchRequest: {
            query: string;
            id: string;
            status: import(".prisma/client").$Enums.SearchRequestStatus;
            createdAt: Date;
            customerId: string;
            windowExpiresAt: Date;
            totalNotified: number;
            updatedAt: Date;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.MatchStatus;
        createdAt: Date;
        searchRequestId: string;
        responseMessage: string | null;
        updatedAt: Date;
        similarityScore: import("@prisma/client-runtime-utils").Decimal;
        providerId: string;
        batch: number;
        respondedAt: Date | null;
        notifiedAt: Date;
    })[]>;
    createBooking(customerId: string, dto: CreateBookingDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.BookingStatus;
        createdAt: Date;
        searchRequestId: string;
        scheduledAt: Date | null;
        customerId: string;
        updatedAt: Date;
        providerId: string;
        cancelledBy: import(".prisma/client").$Enums.CancelledBy | null;
        cancellationReason: string | null;
    }>;
    getBooking(bookingId: string, userId: string): Promise<{
        searchRequest: {
            query: string;
            id: string;
            status: import(".prisma/client").$Enums.SearchRequestStatus;
            createdAt: Date;
            customerId: string;
            windowExpiresAt: Date;
            totalNotified: number;
            updatedAt: Date;
        };
        session: {
            id: string;
            status: import(".prisma/client").$Enums.SessionStatus;
            createdAt: Date;
            customerId: string;
            updatedAt: Date;
            providerId: string;
            bookingId: string;
            hourlyRate: import("@prisma/client-runtime-utils").Decimal;
            purchasedMinutes: number;
            totalMinutes: number;
            timeRemaining: number | null;
            startedAt: Date | null;
            pausedAt: Date | null;
            endedAt: Date | null;
            totalCost: import("@prisma/client-runtime-utils").Decimal | null;
            providerEarning: import("@prisma/client-runtime-utils").Decimal | null;
            platformFee: import("@prisma/client-runtime-utils").Decimal | null;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.BookingStatus;
        createdAt: Date;
        searchRequestId: string;
        scheduledAt: Date | null;
        customerId: string;
        updatedAt: Date;
        providerId: string;
        cancelledBy: import(".prisma/client").$Enums.CancelledBy | null;
        cancellationReason: string | null;
    }>;
    acceptBooking(bookingId: string, providerId: string): Promise<{
        bookingId: string;
        sessionId: string;
    }>;
    rejectBooking(bookingId: string, providerId: string, reason?: string): Promise<{
        bookingId: string;
        status: string;
    }>;
    cancelBooking(bookingId: string, userId: string, dto: CancelBookingDto): Promise<{
        bookingId: string;
        status: string;
    }>;
    getCustomerBookings(customerId: string, params: {
        page: number;
        limit: number;
        status?: string;
    }): Promise<{
        data: ({
            session: {
                id: string;
                status: import(".prisma/client").$Enums.SessionStatus;
                createdAt: Date;
                customerId: string;
                updatedAt: Date;
                providerId: string;
                bookingId: string;
                hourlyRate: import("@prisma/client-runtime-utils").Decimal;
                purchasedMinutes: number;
                totalMinutes: number;
                timeRemaining: number | null;
                startedAt: Date | null;
                pausedAt: Date | null;
                endedAt: Date | null;
                totalCost: import("@prisma/client-runtime-utils").Decimal | null;
                providerEarning: import("@prisma/client-runtime-utils").Decimal | null;
                platformFee: import("@prisma/client-runtime-utils").Decimal | null;
            } | null;
        } & {
            id: string;
            status: import(".prisma/client").$Enums.BookingStatus;
            createdAt: Date;
            searchRequestId: string;
            scheduledAt: Date | null;
            customerId: string;
            updatedAt: Date;
            providerId: string;
            cancelledBy: import(".prisma/client").$Enums.CancelledBy | null;
            cancellationReason: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getProviderBookings(providerId: string, params: {
        page: number;
        limit: number;
        status?: string;
    }): Promise<{
        data: ({
            session: {
                id: string;
                status: import(".prisma/client").$Enums.SessionStatus;
                createdAt: Date;
                customerId: string;
                updatedAt: Date;
                providerId: string;
                bookingId: string;
                hourlyRate: import("@prisma/client-runtime-utils").Decimal;
                purchasedMinutes: number;
                totalMinutes: number;
                timeRemaining: number | null;
                startedAt: Date | null;
                pausedAt: Date | null;
                endedAt: Date | null;
                totalCost: import("@prisma/client-runtime-utils").Decimal | null;
                providerEarning: import("@prisma/client-runtime-utils").Decimal | null;
                platformFee: import("@prisma/client-runtime-utils").Decimal | null;
            } | null;
        } & {
            id: string;
            status: import(".prisma/client").$Enums.BookingStatus;
            createdAt: Date;
            searchRequestId: string;
            scheduledAt: Date | null;
            customerId: string;
            updatedAt: Date;
            providerId: string;
            cancelledBy: import(".prisma/client").$Enums.CancelledBy | null;
            cancellationReason: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAllBookings(params: {
        page: number;
        limit: number;
        status?: string;
        customerId?: string;
        providerId?: string;
    }): Promise<{
        data: ({
            session: {
                id: string;
                status: import(".prisma/client").$Enums.SessionStatus;
                createdAt: Date;
                customerId: string;
                updatedAt: Date;
                providerId: string;
                bookingId: string;
                hourlyRate: import("@prisma/client-runtime-utils").Decimal;
                purchasedMinutes: number;
                totalMinutes: number;
                timeRemaining: number | null;
                startedAt: Date | null;
                pausedAt: Date | null;
                endedAt: Date | null;
                totalCost: import("@prisma/client-runtime-utils").Decimal | null;
                providerEarning: import("@prisma/client-runtime-utils").Decimal | null;
                platformFee: import("@prisma/client-runtime-utils").Decimal | null;
            } | null;
        } & {
            id: string;
            status: import(".prisma/client").$Enums.BookingStatus;
            createdAt: Date;
            searchRequestId: string;
            scheduledAt: Date | null;
            customerId: string;
            updatedAt: Date;
            providerId: string;
            cancelledBy: import(".prisma/client").$Enums.CancelledBy | null;
            cancellationReason: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAllSearchRequests(params: {
        page: number;
        limit: number;
        status?: string;
    }): Promise<{
        data: ({
            _count: {
                matches: number;
            };
        } & {
            query: string;
            id: string;
            status: import(".prisma/client").$Enums.SearchRequestStatus;
            createdAt: Date;
            customerId: string;
            windowExpiresAt: Date;
            totalNotified: number;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    markCompleted(bookingId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.BookingStatus;
        createdAt: Date;
        searchRequestId: string;
        scheduledAt: Date | null;
        customerId: string;
        updatedAt: Date;
        providerId: string;
        cancelledBy: import(".prisma/client").$Enums.CancelledBy | null;
        cancellationReason: string | null;
    }>;
    markRefunded(bookingId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.BookingStatus;
        createdAt: Date;
        searchRequestId: string;
        scheduledAt: Date | null;
        customerId: string;
        updatedAt: Date;
        providerId: string;
        cancelledBy: import(".prisma/client").$Enums.CancelledBy | null;
        cancellationReason: string | null;
    }>;
    private createSession;
    private scheduleWindowExpiry;
    private callSemanticSearch;
    private callLedgerLockFunds;
    private callLedgerUnlockFunds;
    private callIdentityGetProvider;
}
