import { Controller, Post, Body, HttpCode } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { SendNotificationDto } from './dto/send-notification.dto'
import { SendManyNotificationDto } from './dto/send-many.dto'

@Controller('internal/notifications')
export class NotificationInternalController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  @HttpCode(201)
  async send(@Body() dto: SendNotificationDto) {
    return this.notificationService.send(dto)
  }

  @Post('send-many')
  @HttpCode(201)
  async sendMany(@Body() dto: SendManyNotificationDto) {
    return this.notificationService.sendMany(dto)
  }

  @Post('sse/push')
  @HttpCode(200)
  async pushSse(
    @Body() body: { searchRequestId: string; event: string; data: any },
  ) {
    const pushedTo = this.notificationService.pushSseEvent(
      body.searchRequestId,
      body.event,
      body.data,
    )
    return { pushedTo }
  }
}