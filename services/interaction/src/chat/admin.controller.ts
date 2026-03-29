import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common'
import { ChatService } from './chat.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { AdminGuard } from '../common/guards/admin.guard'

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ChatAdminController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  async getAllSessions(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('providerId') providerId?: string,
  ) {
    return this.chatService.getAllSessions({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      customerId,
      providerId,
    })
  }

  @Get('sessions/active')
  async getActiveSessions() {
    return this.chatService.getActiveSessions()
  }

  @Post('sessions/:sessionId/force-end')
  @HttpCode(200)
  async forceEndSession(
    @Param('sessionId') sessionId: string,
    @Body() body: { reason?: string },
  ) {
    return this.chatService.forceEndSession(sessionId, body.reason)
  }
}