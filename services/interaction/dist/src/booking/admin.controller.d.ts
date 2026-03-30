import { BookingService } from './booking.service';
export declare class BookingAdminController {
    private readonly bookingService;
    constructor(bookingService: BookingService);
    getAllBookings(page?: string, limit?: string, status?: string, customerId?: string, providerId?: string): Promise<{
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
    getAllSearchRequests(page?: string, limit?: string, status?: string): Promise<{
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
}
