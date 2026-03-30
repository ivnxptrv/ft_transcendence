import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { Verify2faDto } from './dto/verify-2fa.dto'
import { Disable2faDto } from './dto/disable-2fa.dto'
import { PromoteRoleDto } from './dto/promote-role.dto'
import * as bcrypt from 'bcrypt'
import axios from 'axios'
import type { Response } from 'express'
import { authenticator } from '@otplib/preset-default'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // REGISTER

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (existing) {
      throw new ConflictException('Email already registered')
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        isVerified: true,
      },
    })

    // await this.callUserService(user.id, dto.firstName, dto.lastName, dto.email)
    // await this.callWalletService(user.id)
    // await this.callNotificationService(user.id)

    return { message: 'Registration successful', userId: user.id }
  }

  // LOGIN

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials')
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account suspended')
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    if (user.twoFaEnabled) {
      const tempToken = this.signTempToken(user.id)
      this.setTempTokenCookie(res, tempToken)
      return { requiresTwoFa: true }
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const tokens = this.signTokens(user.id, user.email, user.role)
    this.setTokenCookies(res, tokens)

    return {
      userId: user.id,
      role: user.role,
      requiresTwoFa: false,
    }
  }

  // LOGOUT

  async logout(res: Response) {
    this.clearTokenCookies(res)
    return { message: 'Logged out successfully' }
  }

  // REFRESH

  async refresh(refreshToken: string, res: Response) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      })

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      })

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token')
      }

      const tokens = this.signTokens(user.id, user.email, user.role)
      this.setTokenCookies(res, tokens)

      return { message: 'Tokens refreshed' }
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
  }

  // VALIDATE TOKEN (called by API Gateway)

  async validateToken(token: string) {
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
      })

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      })

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token')
      }

      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      }
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }

  // 2FA

  async setup2fa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })

    if (!user) throw new NotFoundException('User not found')

    const secret = authenticator.generateSecret()
    const qrCodeUrl = authenticator.keyuri(user.email, 'Transcendence', secret)

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFaSecret: secret },
    })

    return { secret, qrCodeUrl }
  }

  async verify2fa(userId: string, dto: Verify2faDto, res: Response) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })

    if (!user || !user.twoFaSecret) {
      throw new BadRequestException('2FA not set up')
    }

    const isValid = authenticator.verify({
      token: dto.code,
      secret: user.twoFaSecret,
    })

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code')
    }

    if (!user.twoFaEnabled) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { twoFaEnabled: true },
      })
      return { message: '2FA enabled successfully' }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    })

    const tokens = this.signTokens(user.id, user.email, user.role)
    this.setTokenCookies(res, tokens)

    return {
      userId: user.id,
      role: user.role,
      requiresTwoFa: false,
    }
  }

  async disable2fa(userId: string, dto: Disable2faDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFaEnabled: false, twoFaSecret: null },
    })

    return { message: '2FA disabled successfully' }
  }

  // OAUTH

  async handleOAuthLogin(
    providerUserId: string,
    email: string,
    accessToken: string,
    refreshToken: string,
    res: Response,
  ) {
    let user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          isVerified: true,
          oauthAccounts: {
            create: {
              provider: 'google',
              providerUserId,
              accessToken,
              refreshToken,
            },
          },
        },
      })

    //   await this.callUserService(user.id, email.split('@')[0], '', email)
    //   await this.callWalletService(user.id)
    //   await this.callNotificationService(user.id)
    } else {
      const existingOAuth = await this.prisma.oAuthAccount.findUnique({
        where: {
          provider_providerUserId: {
            provider: 'google',
            providerUserId,
          },
        },
      })

      if (!existingOAuth) {
        await this.prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: 'google',
            providerUserId,
            accessToken,
            refreshToken,
          },
        })
      }
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account suspended')
    }

    const tokens = this.signTokens(user.id, user.email, user.role)
    this.setTokenCookies(res, tokens)

    return user
  }

  // INTERNAL — PROMOTE ROLE

  async promoteRole(dto: PromoteRoleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    })

    if (!user) throw new NotFoundException('User not found')

    await this.prisma.user.update({
      where: { id: dto.userId },
      data: { role: 'provider' },
    })

    return { userId: dto.userId, role: 'provider' }
  }

  // HELPERS — TOKENS

  private signTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN'),
    })

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
    })

    return { accessToken, refreshToken }
  }

  private signTempToken(userId: string) {
    return this.jwt.sign(
      { sub: userId, temp: true },
      {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: '5m',
      },
    )
  }

  private setTokenCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth/refresh',
    })
  }

  private setTempTokenCookie(res: Response, token: string) {
    res.cookie('temp_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 5 * 60 * 1000,
    })
  }

  private clearTokenCookies(res: Response) {
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    res.clearCookie('temp_token')
  }

  // HELPERS — INTER-SERVICE CALLS

//   private async callUserService(userId: string, firstName: string, lastName: string, email: string) {
//     try {
//       await axios.post(`${this.config.get('USER_SERVICE_URL')}/internal/users/profile`, {
//         userId,
//         firstName,
//         lastName,
//         email,
//       })
//     } catch (err) {
//       console.error('Failed to call User Service:', err.message)
//     }
//   }

//   private async callWalletService(userId: string) {
//     try {
//       await axios.post(`${this.config.get('WALLET_SERVICE_URL')}/internal/wallet/create`, {
//         userId,
//       })
//     } catch (err) {
//       console.error('Failed to call Wallet Service:', err.message)
//     }
//   }

//   private async callNotificationService(userId: string) {
//     try {
//       await axios.post(`${this.config.get('NOTIFICATION_SERVICE_URL')}/internal/notifications/send`, {
//         userId,
//         type: 'welcome',
//         title: 'Welcome to Transcendence',
//         body: 'Your account has been created successfully.',
//         channel: 'in_app',
//       })
//     } catch (err) {
//       console.error('Failed to call Notification Service:', err.message)
//     }
//   }
}