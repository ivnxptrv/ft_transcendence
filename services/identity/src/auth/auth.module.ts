import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './strategies/jwt.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { TempTokenGuard } from '../common/guards/temp-token.guard'
import { InternalController } from './internal.controller'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController, InternalController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    TempTokenGuard,
  ],
})
export class AuthModule {}