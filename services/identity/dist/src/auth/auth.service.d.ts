import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { Disable2faDto } from './dto/disable-2fa.dto';
import { PromoteRoleDto } from './dto/promote-role.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { Response } from 'express';
import { UserService } from '../user/user.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    private readonly userService;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, userService: UserService);
    register(dto: RegisterDto): Promise<{
        message: string;
        userId: string;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        requiresTwoFa: boolean;
        userId?: undefined;
        role?: undefined;
    } | {
        userId: string;
        role: import(".prisma/client").$Enums.Role;
        requiresTwoFa: boolean;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    refresh(refreshToken: string, res: Response): Promise<{
        message: string;
    }>;
    validateToken(token: string): Promise<{
        userId: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        isVerified: boolean;
    }>;
    setup2fa(userId: string): Promise<{
        secret: string;
        qrCodeUrl: string;
    }>;
    verify2fa(userId: string, dto: Verify2faDto, res: Response): Promise<{
        message: string;
        userId?: undefined;
        role?: undefined;
        requiresTwoFa?: undefined;
    } | {
        userId: string;
        role: import(".prisma/client").$Enums.Role;
        requiresTwoFa: boolean;
        message?: undefined;
    }>;
    disable2fa(userId: string, dto: Disable2faDto): Promise<{
        message: string;
    }>;
    handleOAuthLogin(providerUserId: string, email: string, accessToken: string, refreshToken: string, res: Response): Promise<{
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
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    promoteRole(dto: PromoteRoleDto): Promise<{
        userId: string;
        role: string;
    }>;
    private signTokens;
    private signTempToken;
    private setTokenCookies;
    private setTempTokenCookie;
    private clearTokenCookies;
    private callWalletService;
    private callNotificationService;
}
