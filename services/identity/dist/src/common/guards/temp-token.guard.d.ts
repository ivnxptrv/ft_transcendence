import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class TempTokenGuard implements CanActivate {
    private readonly jwt;
    private readonly config;
    constructor(jwt: JwtService, config: ConfigService);
    canActivate(context: ExecutionContext): boolean;
}
