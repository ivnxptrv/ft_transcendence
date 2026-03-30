import { Controller, Post, Patch, Body, HttpCode } from '@nestjs/common'
import { AuthService } from './auth.service'
import { PromoteRoleDto } from './dto/promote-role.dto'

@Controller('internal/auth')
export class InternalController {
  constructor(private readonly authService: AuthService) {}

  @Post('validate')
  @HttpCode(200)
  async validateToken(@Body('token') token: string) {
    return this.authService.validateToken(token)
  }

  @Patch('promote-role')
  @HttpCode(200)
  async promoteRole(@Body() dto: PromoteRoleDto) {
    return this.authService.promoteRole(dto)
  }
}