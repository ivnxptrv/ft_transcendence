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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const header_auth_guard_1 = require("../common/guards/header-auth.guard");
const admin_guard_1 = require("../common/guards/admin.guard");
let AdminController = class AdminController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async getAllUsers(page = '1', limit = '20', role, isActive, search) {
        return this.userService.getAllUsers({
            page: parseInt(page),
            limit: parseInt(limit),
            role,
            isActive: isActive !== undefined ? isActive === 'true' : undefined,
            search,
        });
    }
    async getUserDetail(userId) {
        return this.userService.getAdminUserDetail(userId);
    }
    async updateUserStatus(userId, body) {
        return this.userService.updateUserStatus(userId, body.isActive, body.reason);
    }
    async flagProvider(providerId, body) {
        return this.userService.flagProvider(providerId, body.flagged, body.reason);
    }
    async editProviderTags(providerId, body) {
        return this.userService.editProviderTags(providerId, body.tags);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('role')),
    __param(3, (0, common_1.Query)('isActive')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('users/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserDetail", null);
__decorate([
    (0, common_1.Patch)('users/:userId/status'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Patch)('providers/:providerId/flag'),
    __param(0, (0, common_1.Param)('providerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "flagProvider", null);
__decorate([
    (0, common_1.Patch)('providers/:providerId/tags'),
    __param(0, (0, common_1.Param)('providerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "editProviderTags", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(header_auth_guard_1.HeaderAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [user_service_1.UserService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map