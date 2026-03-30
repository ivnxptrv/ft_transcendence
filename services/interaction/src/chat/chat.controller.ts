import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common'
import { ChatService } from './chat.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { ExtendSessionDto } from './dto/extend-session.dto'
import type { Request } from 'express'

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions/:sessionId')
  async getSession(@Param('sessionId') sessionId: string, @Req() req: Request) {
    const user = req.user as any
    return this.chatService.getSession(sessionId, user.userId)
  }

  @Post('sessions/:sessionId/extend')
  @HttpCode(200)
  async extendSession(
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
    @Body() dto: ExtendSessionDto,
  ) {
    const user = req.user as any
    return this.chatService.extendSession(sessionId, user.userId, dto)
  }

  @Post('sessions/:sessionId/pause')
  @HttpCode(200)
  async pauseSession(@Param('sessionId') sessionId: string, @Req() req: Request) {
    const user = req.user as any
    return this.chatService.pauseSession(sessionId, user.userId)
  }

  @Post('sessions/:sessionId/resume')
  @HttpCode(200)
  async resumeSession(@Param('sessionId') sessionId: string, @Req() req: Request) {
    const user = req.user as any
    return this.chatService.resumeSession(sessionId, user.userId)
  }

  @Post('sessions/:sessionId/satisfy')
  @HttpCode(200)
  async endSessionSatisfied(@Param('sessionId') sessionId: string, @Req() req: Request) {
    const user = req.user as any
    return this.chatService.endSessionSatisfied(sessionId, user.userId)
  }

  @Get('sessions/:sessionId/messages')
  async getMessages(
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('before') before?: string,
  ) {
    const user = req.user as any
    return this.chatService.getMessages(sessionId, user.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      before,
    })
  }

  @Get('sessions/customer/history')
  async getCustomerSessions(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    const user = req.user as any
    return this.chatService.getSessionHistory(user.userId, 'customer', {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    })
  }

  @Get('sessions/provider/history')
  async getProviderSessions(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    const user = req.user as any
    return this.chatService.getSessionHistory(user.userId, 'provider', {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    })
  }
}