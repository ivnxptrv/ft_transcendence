import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()

    const userId = req.headers['x-user-id']
    const email = req.headers['x-user-email']
    const role = req.headers['x-user-role']

    if (!userId) {
      throw new UnauthorizedException('Missing or invalid access token')
    }

    req.user = { userId, email, role }
    return true
  }
}