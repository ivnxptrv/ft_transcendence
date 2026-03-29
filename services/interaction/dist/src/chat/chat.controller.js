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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const extend_session_dto_1 = require("./dto/extend-session.dto");
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async getSession(sessionId, req) {
        const user = req.user;
        return this.chatService.getSession(sessionId, user.userId);
    }
    async extendSession(sessionId, req, dto) {
        const user = req.user;
        return this.chatService.extendSession(sessionId, user.userId, dto);
    }
    async pauseSession(sessionId, req) {
        const user = req.user;
        return this.chatService.pauseSession(sessionId, user.userId);
    }
    async resumeSession(sessionId, req) {
        const user = req.user;
        return this.chatService.resumeSession(sessionId, user.userId);
    }
    async endSessionSatisfied(sessionId, req) {
        const user = req.user;
        return this.chatService.endSessionSatisfied(sessionId, user.userId);
    }
    async getMessages(sessionId, req, page = '1', limit = '50', before) {
        const user = req.user;
        return this.chatService.getMessages(sessionId, user.userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            before,
        });
    }
    async getCustomerSessions(req, page = '1', limit = '20', status) {
        const user = req.user;
        return this.chatService.getSessionHistory(user.userId, 'customer', {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
        });
    }
    async getProviderSessions(req, page = '1', limit = '20', status) {
        const user = req.user;
        return this.chatService.getSessionHistory(user.userId, 'provider', {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
        });
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('sessions/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/extend'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, extend_session_dto_1.ExtendSessionDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "extendSession", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/pause'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "pauseSession", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/resume'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "resumeSession", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/satisfy'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "endSessionSatisfied", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId/messages'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('before')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Get)('sessions/customer/history'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getCustomerSessions", null);
__decorate([
    (0, common_1.Get)('sessions/provider/history'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getProviderSessions", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map