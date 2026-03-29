import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { UpdateTimeSlotsDto } from './dto/update-time-slots.dto';
import type { Request } from 'express';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: Request): Promise<{
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
    updateProfile(req: Request, dto: UpdateProfileDto): Promise<{
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
    createProviderProfile(req: Request, dto: CreateProviderProfileDto): Promise<{
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
    getOwnProviderProfile(req: Request): Promise<{
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
    updateProviderProfile(req: Request, dto: UpdateProviderProfileDto): Promise<{
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
    updateTimeSlots(req: Request, dto: UpdateTimeSlotsDto): Promise<{
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
}
