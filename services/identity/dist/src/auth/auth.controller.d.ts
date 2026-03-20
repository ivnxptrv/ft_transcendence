import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { Disable2faDto } from './dto/disable-2fa.dto';
import type { Request, Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refresh(req: Request, res: Response): Promise<{
        message: string;
    }>;
    setup2fa(req: Request): Promise<{
        secret: string;
        qrCodeUrl: string;
    }>;
    verify2fa(req: Request, dto: Verify2faDto, res: Response): Promise<{
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
    disable2fa(req: Request, dto: Disable2faDto): Promise<{
        message: string;
    }>;
    googleLogin(): void;
    googleCallback(req: Request, res: Response): Promise<void>;
}
