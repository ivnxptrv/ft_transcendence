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
exports.BookingAdminController = void 0;
const common_1 = require("@nestjs/common");
const booking_service_1 = require("./booking.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../common/guards/admin.guard");
let BookingAdminController = class BookingAdminController {
    bookingService;
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    async getAllBookings(page = '1', limit = '20', status, customerId, providerId) {
        return this.bookingService.getAllBookings({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            customerId,
            providerId,
        });
    }
    async getAllSearchRequests(page = '1', limit = '20', status) {
        return this.bookingService.getAllSearchRequests({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
        });
    }
};
exports.BookingAdminController = BookingAdminController;
__decorate([
    (0, common_1.Get)('bookings'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('customerId')),
    __param(4, (0, common_1.Query)('providerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], BookingAdminController.prototype, "getAllBookings", null);
__decorate([
    (0, common_1.Get)('search-requests'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], BookingAdminController.prototype, "getAllSearchRequests", null);
exports.BookingAdminController = BookingAdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [booking_service_1.BookingService])
], BookingAdminController);
//# sourceMappingURL=admin.controller.js.map