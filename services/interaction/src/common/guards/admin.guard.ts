import {
  Injectable,
  ForbiddenException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common'

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    const role = req.headers['x-user-role']

    if (!role || role !== 'admin') {
      throw new ForbiddenException('Admin access required')
    }

    return true
  }
}