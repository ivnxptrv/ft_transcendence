import { UserService } from './user.service';
export declare class AdminController {
    private readonly userService;
    constructor(userService: UserService);
    getAllUsers(page?: string, limit?: string, role?: string, isActive?: string, search?: string): Promise<{
        data: ({
            profile: {
                firstName: string;
                lastName: string;
                userId: string;
                displayName: string | null;
                bio: string | null;
                phone: string | null;
                country: string | null;
                city: string | null;
                id: string;
                avatarUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        } & {
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            passwordHash: string | null;
            isVerified: boolean;
            twoFaSecret: string | null;
            twoFaEnabled: boolean;
            lastLoginAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUserDetail(userId: string): Promise<{
        profile: ({
            providerProfile: ({
                timeSlots: {
                    day: import(".prisma/client").$Enums.AvailabilityDay;
                    startTime: string;
                    endTime: string;
                    id: string;
                    createdAt: Date;
                    providerProfileId: string;
                }[];
            } & {
                userId: string;
                title: string;
                description: string;
                hourlyRate: import("@prisma/client-runtime-utils").Decimal;
                location: string | null;
                languages: string[];
                yearsExperience: number | null;
                isAvailable: boolean;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                profileId: string;
                status: import(".prisma/client").$Enums.ProviderStatus;
                tags: string[];
            }) | null;
        } & {
            firstName: string;
            lastName: string;
            userId: string;
            displayName: string | null;
            bio: string | null;
            phone: string | null;
            country: string | null;
            city: string | null;
            id: string;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        }) | null;
    } & {
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        passwordHash: string | null;
        isVerified: boolean;
        twoFaSecret: string | null;
        twoFaEnabled: boolean;
        lastLoginAt: Date | null;
    }>;
    updateUserStatus(userId: string, body: {
        isActive: boolean;
        reason?: string;
    }): Promise<{
        userId: string;
        isActive: boolean;
        reason: string | undefined;
    }>;
    flagProvider(providerId: string, body: {
        flagged: boolean;
        reason?: string;
    }): Promise<{
        providerId: string;
        flagged: boolean;
        reason: string | undefined;
    }>;
    editProviderTags(providerId: string, body: {
        tags: string[];
    }): Promise<{
        userId: string;
        title: string;
        description: string;
        hourlyRate: import("@prisma/client-runtime-utils").Decimal;
        location: string | null;
        languages: string[];
        yearsExperience: number | null;
        isAvailable: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        profileId: string;
        status: import(".prisma/client").$Enums.ProviderStatus;
        tags: string[];
    }>;
}
