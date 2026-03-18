import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { Disable2faDto } from './dto/disable-2fa.dto';
import { PromoteRoleDto } from './dto/promote-role.dto';
import type { Response } from 'express';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
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
        passwordHash: string | null;
        role: import(".prisma/client").$Enums.Role;
        isVerified: boolean;
        isActive: boolean;
        twoFaSecret: string | null;
        twoFaEnabled: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
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
}
