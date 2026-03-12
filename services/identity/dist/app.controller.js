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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const pg_1 = require("pg");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    async testConnection() {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            return {
                status: 'Error',
                message: 'DATABASE_URL is not defined in .env',
            };
        }
        const pool = new pg_1.Pool({
            connectionString: dbUrl,
        });
        try {
            const res = await pool.query('SELECT NOW() as current_time, version()');
            await pool.end();
            return {
                status: 'Connected!',
                database_time: res.rows[0].current_time,
                postgres_version: res.rows[0].version,
            };
        }
        catch (err) {
            return {
                status: 'Error',
                message: err.message,
            };
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "testConnection", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map