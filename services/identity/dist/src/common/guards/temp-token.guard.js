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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempTokenGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let TempTokenGuard = class TempTokenGuard {
    jwt;
    config;
    constructor(jwt, config) {
        this.jwt = jwt;
        this.config = config;
    }
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const token = req.cookies['temp_token'];
        if (!token) {
            throw new common_1.UnauthorizedException('Missing temp token');
        }
        try {
            const payload = this.jwt.verify(token, {
                secret: this.config.get('JWT_ACCESS_SECRET'),
            });
            if (!payload.temp) {
                throw new common_1.UnauthorizedException('Invalid temp token');
            }
            req.user = { userId: payload.sub };
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired temp token');
        }
    }
};
exports.TempTokenGuard = TempTokenGuard;
exports.TempTokenGuard = TempTokenGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], TempTokenGuard);
//# sourceMappingURL=temp-token.guard.js.map