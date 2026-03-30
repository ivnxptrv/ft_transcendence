import { Controller, Post, Get, Body, Param, HttpCode } from '@nestjs/common'
import { ChatService } from './chat.service'

@Controller('internal/chat')
export class ChatInternalController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  @HttpCode(201)
  async createSession(
    @Body() body: {
      bookingId: string
      customerId: string
      providerId: string
      hourlyRate: number
      purchasedMinutes: number
    },
  ) {
    return this.chatService.createSession(body)
  }

  @Get('sessions/:sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    return this.chatService.getSessionById(sessionId)
  }
}