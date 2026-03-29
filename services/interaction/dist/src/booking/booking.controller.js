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
exports.BookingController = void 0;
const common_1 = require("@nestjs/common");
const booking_service_1 = require("./booking.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const create_search_request_dto_1 = require("./dto/create-search-request.dto");
const respond_match_dto_1 = require("./dto/respond-match.dto");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const cancel_booking_dto_1 = require("./dto/cancel-booking.dto");
let BookingController = class BookingController {
    bookingService;
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    async createSearchRequest(req, dto) {
        const user = req.user;
        return this.bookingService.createSearchRequest(user.userId, dto);
    }
    async getSearchHistory(req, page = '1', limit = '20', status) {
        const user = req.user;
        return this.bookingService.getSearchHistory(user.userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
        });
    }
    async getSearchRequest(searchRequestId, req) {
        const user = req.user;
        return this.bookingService.getSearchRequest(searchRequestId, user.userId);
    }
    async loadMore(searchRequestId, req) {
        const user = req.user;
        return this.bookingService.loadMoreProviders(searchRequestId, user.userId);
    }
    async respondToMatch(matchId, req, dto) {
        const user = req.user;
        return this.bookingService.respondToMatch(matchId, user.userId, dto);
    }
    async getPendingMatches(req) {
        const user = req.user;
        return this.bookingService.getPendingMatches(user.userId);
    }
    async createBooking(req, dto) {
        const user = req.user;
        return this.bookingService.createBooking(user.userId, dto);
    }
    async getCustomerBookings(req, page = '1', limit = '20', status) {
        const user = req.user;
        return this.bookingService.getCustomerBookings(user.userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
        });
    }
    async getProviderBookings(req, page = '1', limit = '20', status) {
        const user = req.user;
        return this.bookingService.getProviderBookings(user.userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
        });
    }
    async getBooking(bookingId, req) {
        const user = req.user;
        return this.bookingService.getBooking(bookingId, user.userId);
    }
    async acceptBooking(bookingId, req) {
        const user = req.user;
        return this.bookingService.acceptBooking(bookingId, user.userId);
    }
    async rejectBooking(bookingId, req, body) {
        const user = req.user;
        return this.bookingService.rejectBooking(bookingId, user.userId, body.reason);
    }
    async cancelBooking(bookingId, req, dto) {
        const user = req.user;
        return this.bookingService.cancelBooking(bookingId, user.userId, dto);
    }
};
exports.BookingController = BookingController;
__decorate([
    (0, common_1.Post)('search'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_search_request_dto_1.CreateSearchRequestDto]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "createSearchRequest", null);
__decorate([
    (0, common_1.Get)('search/history'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getSearchHistory", null);
__decorate([
    (0, common_1.Get)('search/:searchRequestId'),
    __param(0, (0, common_1.Param)('searchRequestId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getSearchRequest", null);
__decorate([
    (0, common_1.Post)('search/:searchRequestId/more'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('searchRequestId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "loadMore", null);
__decorate([
    (0, common_1.Post)('matches/:matchId/respond'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('matchId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, respond_match_dto_1.RespondMatchDto]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "respondToMatch", null);
__decorate([
    (0, common_1.Get)('matches/pending'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getPendingMatches", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Get)('customer/history'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getCustomerBookings", null);
__decorate([
    (0, common_1.Get)('provider/history'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getProviderBookings", null);
__decorate([
    (0, common_1.Get)(':bookingId'),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getBooking", null);
__decorate([
    (0, common_1.Post)(':bookingId/accept'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "acceptBooking", null);
__decorate([
    (0, common_1.Post)(':bookingId/reject'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "rejectBooking", null);
__decorate([
    (0, common_1.Post)(':bookingId/cancel'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, cancel_booking_dto_1.CancelBookingDto]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "cancelBooking", null);
exports.BookingController = BookingController = __decorate([
    (0, common_1.Controller)('booking'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [booking_service_1.BookingService])
], BookingController);
//# sourceMappingURL=booking.controller.js.map