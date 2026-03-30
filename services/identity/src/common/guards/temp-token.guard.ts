import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { CanActivate, ExecutionContext } from '@nestjs/common'

@Injectable()
export class TempTokenGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    const token = req.cookies['temp_token']

    if (!token) {
      throw new UnauthorizedException('Missing temp token')
    }

    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
      })

      if (!payload.temp) {
        throw new UnauthorizedException('Invalid temp token')
      }

      req.user = { userId: payload.sub }
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired temp token')
    }
  }
}