import { BookingService } from './booking.service';
export declare class BookingInternalController {
    private readonly bookingService;
    constructor(bookingService: BookingService);
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
}
