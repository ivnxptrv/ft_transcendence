import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { UpdateTimeSlotsDto } from './dto/update-time-slots.dto';
import { ConfigService } from '@nestjs/config';
export declare class UserService {
    private readonly prisma;
    private readonly config;
    constructor(prisma: PrismaService, config: ConfigService);
    getProfile(userId: string): Promise<{
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
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
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
    }>;
    getPublicProfile(userId: string): Promise<{
        firstName: string;
        lastName: string;
        userId: string;
        displayName: string | null;
        country: string | null;
        city: string | null;
        avatarUrl: string | null;
    }>;
    createProviderProfile(userId: string, dto: CreateProviderProfileDto): Promise<{
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
    }>;
    getOwnProviderProfile(userId: string): Promise<{
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
    }>;
    updateProviderProfile(userId: string, dto: UpdateProviderProfileDto): Promise<{
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
    }>;
    getPublicProviderProfile(providerId: string): Promise<{
        profile: {
            firstName: string;
            lastName: string;
            displayName: string | null;
            avatarUrl: string | null;
        };
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
    }>;
    updateTimeSlots(userId: string, dto: UpdateTimeSlotsDto): Promise<{
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
    }>;
    getAllUsers(params: {
        page: number;
        limit: number;
        role?: string;
        isActive?: boolean;
        search?: string;
    }): Promise<{
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
    getAdminUserDetail(userId: string): Promise<{
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
    updateUserStatus(userId: string, isActive: boolean, reason?: string): Promise<{
        userId: string;
        isActive: boolean;
        reason: string | undefined;
    }>;
    flagProvider(providerId: string, flagged: boolean, reason?: string): Promise<{
        providerId: string;
        flagged: boolean;
        reason: string | undefined;
    }>;
    editProviderTags(providerId: string, tags: string[]): Promise<{
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
    createProfileInternal(userId: string, firstName: string, lastName: string, email: string): Promise<{
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
    }>;
    getBasicUserInfo(userId: string): Promise<{
        role: import(".prisma/client").$Enums.Role | undefined;
        firstName: string;
        lastName: string;
        userId: string;
        displayName: string | null;
        avatarUrl: string | null;
    }>;
    private callAuthService;
    private callSemanticService;
}
