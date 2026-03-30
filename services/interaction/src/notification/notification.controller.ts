import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common'
import { NotificationService } from './notification.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import type { Request, Response } from 'express'

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('isRead') isRead?: string,
    @Query('severity') severity?: string,
  ) {
    const user = req.user as any
    return this.notificationService.getUserNotifications(user.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      severity,
    })
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: Request) {
    const user = req.user as any
    return this.notificationService.getUnreadCount(user.userId)
  }

  @Patch(':notificationId/read')
  async markRead(@Param('notificationId') id: string, @Req() req: Request) {
    const user = req.user as any
    return this.notificationService.markRead(id, user.userId)
  }

  @Patch('read-all')
  async markAllRead(@Req() req: Request) {
    const user = req.user as any
    return this.notificationService.markAllRead(user.userId)
  }

  @Delete(':notificationId')
  async deleteNotification(@Param('notificationId') id: string, @Req() req: Request) {
    const user = req.user as any
    return this.notificationService.deleteNotification(id, user.userId)
  }

  @Get('sse/search/:searchRequestId')
  async searchSse(
    @Param('searchRequestId') searchRequestId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const client = { res }
    this.notificationService.registerSseClient(searchRequestId, client)

    res.write(`event: connected\ndata: ${JSON.stringify({ searchRequestId })}\n\n`)

    req.on('close', () => {
      this.notificationService.removeSseClient(searchRequestId, client)
    })
  }

  @Get('sse/live')
  async liveSse(@Req() req: Request, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const user = req.user as any
    res.write(`event: connected\ndata: ${JSON.stringify({ userId: user.userId })}\n\n`)

    const interval = setInterval(() => {
      res.write(': heartbeat\n\n')
    }, 30000)

    req.on('close', () => {
      clearInterval(interval)
    })
  }
}