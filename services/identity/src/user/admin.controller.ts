import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common'
import { UserService } from './user.service'
import { HeaderAuthGuard } from '../common/guards/header-auth.guard'
import { AdminGuard } from '../common/guards/admin.guard'

@Controller('admin')
@UseGuards(HeaderAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  async getAllUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    return this.userService.getAllUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search,
    })
  }

  @Get('users/:userId')
  async getUserDetail(@Param('userId') userId: string) {
    return this.userService.getAdminUserDetail(userId)
  }

  @Patch('users/:userId/status')
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() body: { isActive: boolean; reason?: string },
  ) {
    return this.userService.updateUserStatus(userId, body.isActive, body.reason)
  }

  @Patch('providers/:providerId/flag')
  async flagProvider(
    @Param('providerId') providerId: string,
    @Body() body: { flagged: boolean; reason?: string },
  ) {
    return this.userService.flagProvider(providerId, body.flagged, body.reason)
  }

  @Patch('providers/:providerId/tags')
  async editProviderTags(
    @Param('providerId') providerId: string,
    @Body() body: { tags: string[] },
  ) {
    return this.userService.editProviderTags(providerId, body.tags)
  }
}