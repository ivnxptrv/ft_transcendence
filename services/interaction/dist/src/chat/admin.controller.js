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
exports.ChatAdminController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../common/guards/admin.guard");
let ChatAdminController = class ChatAdminController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async getAllSessions(page = '1', limit = '20', status, customerId, providerId) {
        return this.chatService.getAllSessions({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            customerId,
            providerId,
        });
    }
    async getActiveSessions() {
        return this.chatService.getActiveSessions();
    }
    async forceEndSession(sessionId, body) {
        return this.chatService.forceEndSession(sessionId, body.reason);
    }
};
exports.ChatAdminController = ChatAdminController;
__decorate([
    (0, common_1.Get)('sessions'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('customerId')),
    __param(4, (0, common_1.Query)('providerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ChatAdminController.prototype, "getAllSessions", null);
__decorate([
    (0, common_1.Get)('sessions/active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatAdminController.prototype, "getActiveSessions", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/force-end'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatAdminController.prototype, "forceEndSession", null);
exports.ChatAdminController = ChatAdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatAdminController);
//# sourceMappingURL=admin.controller.js.map