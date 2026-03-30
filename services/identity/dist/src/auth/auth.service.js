"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const axios_1 = __importDefault(require("axios"));
const preset_default_1 = require("@otplib/preset-default");
const user_service_1 = require("../user/user.service");
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    userService;
    constructor(prisma, jwt, config, userService) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.userService = userService;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                isVerified: true,
            },
        });
        await this.userService.createProfileInternal(user.id, dto.firstName, dto.lastName, dto.email);
        await this.callWalletService(user.id);
        await this.callNotificationService(user.id);
        return { message: 'Registration successful', userId: user.id };
    }
    async login(dto, res) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Account suspended');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.twoFaEnabled) {
            const tempToken = this.signTempToken(user.id);
            this.setTempTokenCookie(res, tempToken);
            return { requiresTwoFa: true };
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const tokens = this.signTokens(user.id, user.email, user.role);
        this.setTokenCookies(res, tokens);
        return {
            userId: user.id,
            role: user.role,
            requiresTwoFa: false,
        };
    }
    async logout(res) {
        this.clearTokenCookies(res);
        return { message: 'Logged out successfully' };
    }
    async refresh(refreshToken, res) {
        try {
            const payload = this.jwt.verify(refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            const tokens = this.signTokens(user.id, user.email, user.role);
            this.setTokenCookies(res, tokens);
            return { message: 'Tokens refreshed' };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    async validateToken(token) {
        try {
            const payload = this.jwt.verify(token, {
                secret: this.config.get('JWT_ACCESS_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            return {
                userId: user.id,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
            };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
    async setup2fa(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const secret = preset_default_1.authenticator.generateSecret();
        const qrCodeUrl = preset_default_1.authenticator.keyuri(user.email, 'Transcendence', secret);
        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFaSecret: secret },
        });
        return { secret, qrCodeUrl };
    }
    async verify2fa(userId, dto, res) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFaSecret) {
            throw new common_1.BadRequestException('2FA not set up');
        }
        const isValid = preset_default_1.authenticator.verify({
            token: dto.code,
            secret: user.twoFaSecret,
        });
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid 2FA code');
        }
        if (!user.twoFaEnabled) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { twoFaEnabled: true },
            });
            return { message: '2FA enabled successfully' };
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
        });
        const tokens = this.signTokens(user.id, user.email, user.role);
        this.setTokenCookies(res, tokens);
        return {
            userId: user.id,
            role: user.role,
            requiresTwoFa: false,
        };
    }
    async disable2fa(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFaEnabled: false, twoFaSecret: null },
        });
        return { message: '2FA disabled successfully' };
    }
    async handleOAuthLogin(providerUserId, email, accessToken, refreshToken, res) {
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    isVerified: true,
                    oauthAccounts: {
                        create: {
                            provider: 'google',
                            providerUserId,
                            accessToken,
                            refreshToken,
                        },
                    },
                },
            });
            await this.userService.createProfileInternal(user.id, email.split('@')[0], '', email);
            await this.callWalletService(user.id);
            await this.callNotificationService(user.id);
        }
        else {
            const existingOAuth = await this.prisma.oAuthAccount.findUnique({
                where: {
                    provider_providerUserId: {
                        provider: 'google',
                        providerUserId,
                    },
                },
            });
            if (!existingOAuth) {
                await this.prisma.oAuthAccount.create({
                    data: {
                        userId: user.id,
                        provider: 'google',
                        providerUserId,
                        accessToken,
                        refreshToken,
                    },
                });
            }
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Account suspended');
        }
        const tokens = this.signTokens(user.id, user.email, user.role);
        this.setTokenCookies(res, tokens);
        return user;
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isValid)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        const newHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash },
        });
        return { message: 'Password changed successfully' };
    }
    async promoteRole(dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.user.update({
            where: { id: dto.userId },
            data: { role: 'provider' },
        });
        return { userId: dto.userId, role: 'provider' };
    }
    signTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwt.sign(payload, {
            secret: this.config.get('JWT_ACCESS_SECRET'),
            expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN'),
        });
        const refreshToken = this.jwt.sign(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
        });
        return { accessToken, refreshToken };
    }
    signTempToken(userId) {
        return this.jwt.sign({ sub: userId, temp: true }, {
            secret: this.config.get('JWT_ACCESS_SECRET'),
            expiresIn: '5m',
        });
    }
    setTokenCookies(res, tokens) {
        res.cookie('access_token', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/api/v1/auth/refresh',
        });
    }
    setTempTokenCookie(res, token) {
        res.cookie('temp_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60 * 1000,
        });
    }
    clearTokenCookies(res) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        res.clearCookie('temp_token');
    }
    async callWalletService(userId) {
        try {
            await axios_1.default.post(`${this.config.get('WALLET_SERVICE_URL')}/internal/wallet/create`, {
                userId,
            });
        }
        catch (err) {
            console.error('Failed to call Wallet Service:', err.message);
        }
    }
    async callNotificationService(userId) {
        try {
            await axios_1.default.post(`${this.config.get('NOTIFICATION_SERVICE_URL')}/internal/notifications/send`, {
                userId,
                type: 'welcome',
                title: 'Welcome to Transcendence',
                body: 'Your account has been created successfully.',
                channel: 'in_app',
            });
        }
        catch (err) {
            console.error('Failed to call Notification Service:', err.message);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        user_service_1.UserService])
], AuthService);
//# sourceMappingURL=auth.service.js.map