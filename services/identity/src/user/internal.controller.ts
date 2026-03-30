import { Controller, Post, Get, Body, Param } from '@nestjs/common'
import { UserService } from './user.service'

@Controller('internal/users')
export class UserInternalController {
  constructor(private readonly userService: UserService) {}

  @Post('profile')
  async createProfile(
    @Body()
    body: {
      userId: string
      firstName: string
      lastName: string
      email: string
    },
  ) {
    return this.userService.createProfileInternal(
      body.userId,
      body.firstName,
      body.lastName,
      body.email,
    )
  }

  @Get(':userId/basic')
  async getBasicUserInfo(@Param('userId') userId: string) {
    return this.userService.getBasicUserInfo(userId)
  }
}