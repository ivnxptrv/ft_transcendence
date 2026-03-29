import {
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common'
import { UserService } from './user.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto'
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto'
import { UpdateTimeSlotsDto } from './dto/update-time-slots.dto'
import { HeaderAuthGuard } from '../common/guards/header-auth.guard'
import type { Request } from 'express'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(HeaderAuthGuard)
  async getProfile(@Req() req: Request) {
    const user = req.user as any
    return this.userService.getProfile(user.userId)
  }

  @Patch('me')
  @UseGuards(HeaderAuthGuard)
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const user = req.user as any
    return this.userService.updateProfile(user.userId, dto)
  }

  @Get(':userId')
  @UseGuards(HeaderAuthGuard)
  async getPublicProfile(@Param('userId') userId: string) {
    return this.userService.getPublicProfile(userId)
  }

  @Post('me/provider-profile')
  @UseGuards(HeaderAuthGuard)
  async createProviderProfile(
    @Req() req: Request,
    @Body() dto: CreateProviderProfileDto,
  ) {
    const user = req.user as any
    return this.userService.createProviderProfile(user.userId, dto)
  }

  @Get('me/provider-profile')
  @UseGuards(HeaderAuthGuard)
  async getOwnProviderProfile(@Req() req: Request) {
    const user = req.user as any
    return this.userService.getOwnProviderProfile(user.userId)
  }

  @Patch('me/provider-profile')
  @UseGuards(HeaderAuthGuard)
  async updateProviderProfile(
    @Req() req: Request,
    @Body() dto: UpdateProviderProfileDto,
  ) {
    const user = req.user as any
    return this.userService.updateProviderProfile(user.userId, dto)
  }

  @Get('providers/:providerId')
  @UseGuards(HeaderAuthGuard)
  async getPublicProviderProfile(@Param('providerId') providerId: string) {
    return this.userService.getPublicProviderProfile(providerId)
  }

  @Put('me/provider-profile/time-slots')
  @UseGuards(HeaderAuthGuard)
  async updateTimeSlots(
    @Req() req: Request,
    @Body() dto: UpdateTimeSlotsDto,
  ) {
    const user = req.user as any
    return this.userService.updateTimeSlots(user.userId, dto)
  }
}