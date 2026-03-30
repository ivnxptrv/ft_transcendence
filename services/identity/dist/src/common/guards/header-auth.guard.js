"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderAuthGuard = void 0;
const common_1 = require("@nestjs/common");
let HeaderAuthGuard = class HeaderAuthGuard {
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const userId = req.headers['x-user-id'];
        const email = req.headers['x-user-email'];
        const role = req.headers['x-user-role'];
        if (!userId) {
            throw new common_1.UnauthorizedException('Missing or invalid access token');
        }
        req.user = { userId, email, role };
        return true;
    }
};
exports.HeaderAuthGuard = HeaderAuthGuard;
exports.HeaderAuthGuard = HeaderAuthGuard = __decorate([
    (0, common_1.Injectable)()
], HeaderAuthGuard);
//# sourceMappingURL=header-auth.guard.js.map