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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const create_provider_profile_dto_1 = require("./dto/create-provider-profile.dto");
const update_provider_profile_dto_1 = require("./dto/update-provider-profile.dto");
const update_time_slots_dto_1 = require("./dto/update-time-slots.dto");
const header_auth_guard_1 = require("../common/guards/header-auth.guard");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async getProfile(req) {
        const user = req.user;
        return this.userService.getProfile(user.userId);
    }
    async updateProfile(req, dto) {
        const user = req.user;
        return this.userService.updateProfile(user.userId, dto);
    }
    async getPublicProfile(userId) {
        return this.userService.getPublicProfile(userId);
    }
    async createProviderProfile(req, dto) {
        const user = req.user;
        return this.userService.createProviderProfile(user.userId, dto);
    }
    async getOwnProviderProfile(req) {
        const user = req.user;
        return this.userService.getOwnProviderProfile(user.userId);
    }
    async updateProviderProfile(req, dto) {
        const user = req.user;
        return this.userService.updateProviderProfile(user.userId, dto);
    }
    async getPublicProviderProfile(providerId) {
        return this.userService.getPublicProviderProfile(providerId);
    }
    async updateTimeSlots(req, dto) {
        const user = req.user;
        return this.userService.updateTimeSlots(user.userId, dto);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(header_auth_guard_1.HeaderAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.UseGuards)(header_auth_guard_1.HeaderAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)(':userId'),
    (0, common_1.UseGuards)(header_auth_guard_1.HeaderAuthGuard),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getPublicProfile", null);
__decorate([
    (0, common_1.Post)('me/provider-profile'),
    (0, common_1.UseGuards)(header_auth_guard_1.HeaderAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_provider_profile_dto_1.CreateProviderProfileDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createProviderProfile", null);
__decorate([
    (0, common_1.Get)('me/provider-profile'),
    (0, common_1.UseGuards)(header_auth_guard_1.HeaderAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getOwnProviderProfile", null);
__decorate([
    (0, common_1.Patch)('me/provider-profile'),
    (0, common_1.UseGuards)(header_auth_guard_1.HeaderAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_provider_profile_dto_1.UpdateProviderProfileDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProviderProfile", null);
__decorate([
    (0, common_1.Get)('providers/:providerId'),
    (0, common_1.UseGuards)(header_auth_guard_1.HeaderAuthGuard),
    __param(0, (0, common_1.Param)('providerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getPublicProviderProfile", null);
__decorate([
    (0, common_1.Put)('me/provider-profile/time-slots'),
    (0, common_1.UseGuards)(header_auth_guard_1.HeaderAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_time_slots_dto_1.UpdateTimeSlotsDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateTimeSlots", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map