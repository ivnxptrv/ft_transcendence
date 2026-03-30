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
exports.BookingInternalController = void 0;
const common_1 = require("@nestjs/common");
const booking_service_1 = require("./booking.service");
let BookingInternalController = class BookingInternalController {
    bookingService;
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    async markCompleted(bookingId) {
        return this.bookingService.markCompleted(bookingId);
    }
    async markRefunded(bookingId) {
        return this.bookingService.markRefunded(bookingId);
    }
};
exports.BookingInternalController = BookingInternalController;
__decorate([
    (0, common_1.Patch)(':bookingId/complete'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingInternalController.prototype, "markCompleted", null);
__decorate([
    (0, common_1.Patch)(':bookingId/refunded'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingInternalController.prototype, "markRefunded", null);
exports.BookingInternalController = BookingInternalController = __decorate([
    (0, common_1.Controller)('internal/booking'),
    __metadata("design:paramtypes", [booking_service_1.BookingService])
], BookingInternalController);
//# sourceMappingURL=internal.controller.js.map