import { BookingService } from './booking.service';
import { CreateSearchRequestDto } from './dto/create-search-request.dto';
import { RespondMatchDto } from './dto/respond-match.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import type { Request } from 'express';
export declare class BookingController {
    private readonly bookingService;
    constructor(bookingService: BookingService);
    createSearchRequest(req: Request, dto: CreateSearchRequestDto): Promise<{
        searchRequestId: string;
        windowExpiresAt: Date;
        totalNotified: any;
    }>;
    getSearchHistory(req: Request, page?: string, limit?: string, status?: string): Promise<{
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
    getSearchRequest(searchRequestId: string, req: Request): Promise<{
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
    loadMore(searchRequestId: string, req: Request): Promise<{
        totalNotified: any;
        hasMore: boolean;
    }>;
    respondToMatch(matchId: string, req: Request, dto: RespondMatchDto): Promise<{
        matchId: string;
        status: string;
    }>;
    getPendingMatches(req: Request): Promise<({
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
    createBooking(req: Request, dto: CreateBookingDto): Promise<{
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
    getCustomerBookings(req: Request, page?: string, limit?: string, status?: string): Promise<{
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
    getProviderBookings(req: Request, page?: string, limit?: string, status?: string): Promise<{
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
    getBooking(bookingId: string, req: Request): Promise<{
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
    acceptBooking(bookingId: string, req: Request): Promise<{
        bookingId: string;
        sessionId: string;
    }>;
    rejectBooking(bookingId: string, req: Request, body: {
        reason?: string;
    }): Promise<{
        bookingId: string;
        status: string;
    }>;
    cancelBooking(bookingId: string, req: Request, dto: CancelBookingDto): Promise<{
        bookingId: string;
        status: string;
    }>;
}
