import {
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common'
import { UserService } from './user.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto'
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto'
import { UpdateTimeSlotsDto } from './dto/update-time-slots.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import type { Request } from 'express'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // PROFILE

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    const user = req.user as any
    return this.userService.getProfile(user.userId)
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const user = req.user as any
    return this.userService.updateProfile(user.userId, dto)
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async getPublicProfile(@Param('userId') userId: string) {
    return this.userService.getPublicProfile(userId)
  }

  // PROVIDER PROFILE

  @Post('me/provider-profile')
  @UseGuards(JwtAuthGuard)
  async createProviderProfile(
    @Req() req: Request,
    @Body() dto: CreateProviderProfileDto,
  ) {
    const user = req.user as any
    return this.userService.createProviderProfile(user.userId, dto)
  }

  @Get('me/provider-profile')
  @UseGuards(JwtAuthGuard)
  async getOwnProviderProfile(@Req() req: Request) {
    const user = req.user as any
    return this.userService.getOwnProviderProfile(user.userId)
  }

  @Patch('me/provider-profile')
  @UseGuards(JwtAuthGuard)
  async updateProviderProfile(
    @Req() req: Request,
    @Body() dto: UpdateProviderProfileDto,
  ) {
    const user = req.user as any
    return this.userService.updateProviderProfile(user.userId, dto)
  }

  @Get('providers/:providerId')
  @UseGuards(JwtAuthGuard)
  async getPublicProviderProfile(@Param('providerId') providerId: string) {
    return this.userService.getPublicProviderProfile(providerId)
  }

  // TIME SLOTS

  @Put('me/provider-profile/time-slots')
  @UseGuards(JwtAuthGuard)
  async updateTimeSlots(
    @Req() req: Request,
    @Body() dto: UpdateTimeSlotsDto,
  ) {
    const user = req.user as any
    return this.userService.updateTimeSlots(user.userId, dto)
  }
}