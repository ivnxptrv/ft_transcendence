"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
let UserService = class UserService {
    prisma;
    config;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async getProfile(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            include: { providerProfile: { include: { timeSlots: true } } },
        });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        return profile;
    }
    async updateProfile(userId, dto) {
        const profile = await this.prisma.profile.findUnique({ where: { userId } });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        return this.prisma.profile.update({
            where: { userId },
            data: dto,
        });
    }
    async getPublicProfile(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            select: {
                userId: true,
                firstName: true,
                lastName: true,
                displayName: true,
                avatarUrl: true,
                city: true,
                country: true,
            },
        });
        if (!profile)
            throw new common_1.NotFoundException('User not found');
        return profile;
    }
    async createProviderProfile(userId, dto) {
        const profile = await this.prisma.profile.findUnique({ where: { userId } });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        const existing = await this.prisma.providerProfile.findUnique({
            where: { userId },
        });
        if (existing)
            throw new common_1.ConflictException('Provider profile already exists');
        const providerProfile = await this.prisma.providerProfile.create({
            data: {
                profileId: profile.id,
                userId,
                title: dto.title,
                description: dto.description,
                hourlyRate: dto.hourlyRate,
                location: dto.location,
                languages: dto.languages ?? [],
                yearsExperience: dto.yearsExperience,
                timeSlots: dto.timeSlots
                    ? {
                        create: dto.timeSlots.map((slot) => ({
                            day: slot.day,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                        })),
                    }
                    : undefined,
            },
            include: { timeSlots: true },
        });
        await this.callAuthService(userId);
        await this.callSemanticService(userId, dto.title, dto.description, dto.location, dto.languages);
        return providerProfile;
    }
    async getOwnProviderProfile(userId) {
        const providerProfile = await this.prisma.providerProfile.findUnique({
            where: { userId },
            include: { timeSlots: true },
        });
        if (!providerProfile)
            throw new common_1.NotFoundException('Provider profile not found');
        return providerProfile;
    }
    async updateProviderProfile(userId, dto) {
        const providerProfile = await this.prisma.providerProfile.findUnique({
            where: { userId },
        });
        if (!providerProfile)
            throw new common_1.NotFoundException('Provider profile not found');
        const updated = await this.prisma.providerProfile.update({
            where: { userId },
            data: {
                ...dto,
                hourlyRate: dto.hourlyRate !== undefined ? dto.hourlyRate : undefined,
                status: 'pending',
            },
            include: { timeSlots: true },
        });
        await this.callSemanticService(userId, updated.title, updated.description, updated.location ?? undefined, updated.languages);
        return updated;
    }
    async getPublicProviderProfile(providerId) {
        const providerProfile = await this.prisma.providerProfile.findUnique({
            where: { userId: providerId },
            include: {
                timeSlots: true,
                profile: {
                    select: {
                        firstName: true,
                        lastName: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        if (!providerProfile)
            throw new common_1.NotFoundException('Provider not found');
        if (providerProfile.status !== 'active')
            throw new common_1.NotFoundException('Provider not found');
        return providerProfile;
    }
    async updateTimeSlots(userId, dto) {
        const providerProfile = await this.prisma.providerProfile.findUnique({
            where: { userId },
        });
        if (!providerProfile)
            throw new common_1.NotFoundException('Provider profile not found');
        await this.prisma.timeSlot.deleteMany({
            where: { providerProfileId: providerProfile.id },
        });
        return this.prisma.providerProfile.update({
            where: { userId },
            data: {
                timeSlots: {
                    create: dto.timeSlots.map((slot) => ({
                        day: slot.day,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                    })),
                },
            },
            include: { timeSlots: true },
        });
    }
    async getAllUsers(params) {
        const { page, limit, role, isActive, search } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (role)
            where.role = role;
        if (isActive !== undefined)
            where.isActive = isActive;
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                {
                    profile: {
                        OR: [
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: { profile: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getAdminUserDetail(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: {
                    include: {
                        providerProfile: { include: { timeSlots: true } },
                    },
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateUserStatus(userId, isActive, reason) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.user.update({
            where: { id: userId },
            data: { isActive },
        });
        return { userId, isActive, reason };
    }
    async flagProvider(providerId, flagged, reason) {
        const providerProfile = await this.prisma.providerProfile.findUnique({
            where: { userId: providerId },
        });
        if (!providerProfile)
            throw new common_1.NotFoundException('Provider not found');
        await this.prisma.providerProfile.update({
            where: { userId: providerId },
            data: { status: flagged ? 'flagged' : 'active' },
        });
        return { providerId, flagged, reason };
    }
    async editProviderTags(providerId, tags) {
        const providerProfile = await this.prisma.providerProfile.findUnique({
            where: { userId: providerId },
        });
        if (!providerProfile)
            throw new common_1.NotFoundException('Provider not found');
        return this.prisma.providerProfile.update({
            where: { userId: providerId },
            data: { tags },
        });
    }
    async createProfileInternal(userId, firstName, lastName, email) {
        const existing = await this.prisma.profile.findUnique({ where: { userId } });
        if (existing)
            return existing;
        return this.prisma.profile.create({
            data: {
                userId,
                firstName,
                lastName,
                displayName: `${firstName} ${lastName}`,
            },
        });
    }
    async getBasicUserInfo(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            select: {
                userId: true,
                firstName: true,
                lastName: true,
                displayName: true,
                avatarUrl: true,
            },
        });
        if (!profile)
            throw new common_1.NotFoundException('User not found');
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        return { ...profile, role: user?.role };
    }
    async callAuthService(userId) {
        try {
            await axios_1.default.patch(`${this.config.get('IDENTITY_HOST')}:${this.config.get('IDENTITY_PORT')}/internal/auth/promote-role`, { userId });
        }
        catch (err) {
            console.error('Failed to promote role:', err.message);
        }
    }
    async callSemanticService(providerId, title, description, location, languages) {
        try {
            await axios_1.default.post(`${this.config.get('SEMANTIC_SERVICE_URL')}/embed/provider`, { providerId, title, description, location, languages });
        }
        catch (err) {
            console.error('Failed to call Semantic Service:', err.message);
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], UserService);
//# sourceMappingURL=user.service.js.map