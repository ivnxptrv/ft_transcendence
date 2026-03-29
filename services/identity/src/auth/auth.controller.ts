import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  Patch,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { Verify2faDto } from './dto/verify-2fa.dto'
import { Disable2faDto } from './dto/disable-2fa.dto'
import { PromoteRoleDto } from './dto/promote-role.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { GoogleAuthGuard } from '../common/guards/google-auth.guard'
import { TempTokenGuard } from '../common/guards/temp-token.guard'
import type { Request, Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, res)
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res)
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token']
    return this.authService.refresh(refreshToken, res)
  }

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  async setup2fa(@Req() req: Request) {
    const user = req.user as any
    return this.authService.setup2fa(user.userId)
  }

  @Post('2fa/verify')
  @HttpCode(200)
  @UseGuards(TempTokenGuard)
  async verify2fa(
    @Req() req: Request,
    @Body() dto: Verify2faDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as any
    return this.authService.verify2fa(user.userId, dto, res)
  }

  @Post('2fa/disable')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async disable2fa(
    @Req() req: Request,
    @Body() dto: Disable2faDto,
  ) {
    const user = req.user as any
    return this.authService.disable2fa(user.userId, dto)
  }

  @Get('oauth/google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('oauth/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { providerUserId, email, accessToken, refreshToken } = req.user as any

    await this.authService.handleOAuthLogin(
      providerUserId,
      email,
      accessToken,
      refreshToken,
      res,
    )

    res.redirect(process.env.FRONTEND_URL ?? 'http://localhost:80')
  }


	@Post('change-password')
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	async changePassword(
	  @Req() req: Request,
	  @Body() dto: ChangePasswordDto,
	) {
	  const user = req.user as any
	  return this.authService.changePassword(user.userId, dto)
	}

}