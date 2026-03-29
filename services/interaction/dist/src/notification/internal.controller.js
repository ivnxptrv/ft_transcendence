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
exports.NotificationInternalController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const send_notification_dto_1 = require("./dto/send-notification.dto");
const send_many_dto_1 = require("./dto/send-many.dto");
let NotificationInternalController = class NotificationInternalController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async send(dto) {
        return this.notificationService.send(dto);
    }
    async sendMany(dto) {
        return this.notificationService.sendMany(dto);
    }
    async pushSse(body) {
        const pushedTo = this.notificationService.pushSseEvent(body.searchRequestId, body.event, body.data);
        return { pushedTo };
    }
};
exports.NotificationInternalController = NotificationInternalController;
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_notification_dto_1.SendNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationInternalController.prototype, "send", null);
__decorate([
    (0, common_1.Post)('send-many'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_many_dto_1.SendManyNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationInternalController.prototype, "sendMany", null);
__decorate([
    (0, common_1.Post)('sse/push'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationInternalController.prototype, "pushSse", null);
exports.NotificationInternalController = NotificationInternalController = __decorate([
    (0, common_1.Controller)('internal/notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationInternalController);
//# sourceMappingURL=internal.controller.js.map