import { UserService } from './user.service';
export declare class UserInternalController {
    private readonly userService;
    constructor(userService: UserService);
    createProfile(body: {
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
    }): Promise<{
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
}
