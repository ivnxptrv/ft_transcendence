import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { NotificationGateway } from './notification.gateway'
import { SendNotificationDto } from './dto/send-notification.dto'
import { SendManyNotificationDto } from './dto/send-many.dto'

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
  ) {}

  // SEND SINGLE

  async send(dto: SendNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        channel: dto.channel,
        severity: dto.severity ?? 'info',
        title: dto.title,
        body: dto.body,
        data: dto.data ?? undefined,
        referenceId: dto.referenceId,
        referenceType: dto.referenceType,
        status: 'sent',
        sentAt: new Date(),
      },
    })

    if (dto.channel === 'websocket' || dto.channel === 'in_app') {
      this.gateway.sendToUser(dto.userId, 'notification', notification)
    }

    return notification
  }

  // SEND MANY

  async sendMany(dto: SendManyNotificationDto) {
    const notifications = await this.prisma.notification.createMany({
      data: dto.userIds.map((userId) => ({
        userId,
        type: dto.type,
        channel: dto.channel,
        severity: dto.severity ?? 'info',
        title: dto.title,
        body: dto.body,
        data: dto.data ?? undefined,
        status: 'sent',
        sentAt: new Date(),
      })),
    })

    if (dto.channel === 'websocket' || dto.channel === 'in_app') {
      for (const userId of dto.userIds) {
        this.gateway.sendToUser(userId, 'notification', {
          type: dto.type,
          title: dto.title,
          body: dto.body,
        })
      }
    }

    return { sentCount: notifications.count }
  }

  // GET USER NOTIFICATIONS

  async getUserNotifications(
    userId: string,
    params: { page: number; limit: number; isRead?: boolean; severity?: string },
  ) {
    const { page, limit, isRead, severity } = params
    const skip = (page - 1) * limit

    const where: any = { userId }
    if (isRead !== undefined) where.isRead = isRead
    if (severity) where.severity = severity

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ])

    return {
      data,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    })
    return { count }
  }

  async markRead(notificationId: string, userId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    })
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
    return { updatedCount: result.count }
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    })
  }

  // ADMIN

  async getAll(params: {
    page: number
    limit: number
    userId?: string
    type?: string
    severity?: string
    status?: string
  }) {
    const { page, limit, userId, type, severity, status } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (userId) where.userId = userId
    if (type) where.type = type
    if (severity) where.severity = severity
    if (status) where.status = status

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async broadcast(params: {
    title: string
    body: string
    audience: string
    severity?: string
  }) {
    this.gateway.sendToAll('notification', {
      type: 'admin_broadcast',
      title: params.title,
      body: params.body,
      severity: params.severity ?? 'info',
    })

    return { message: 'Broadcast sent' }
  }

  // SSE

  private sseClients = new Map<string, Set<any>>()

  registerSseClient(searchRequestId: string, client: any) {
    if (!this.sseClients.has(searchRequestId)) {
      this.sseClients.set(searchRequestId, new Set())
    }
    this.sseClients.get(searchRequestId)!.add(client)
  }

  removeSseClient(searchRequestId: string, client: any) {
    this.sseClients.get(searchRequestId)?.delete(client)
  }

  pushSseEvent(searchRequestId: string, event: string, data: any) {
    const clients = this.sseClients.get(searchRequestId)
    if (!clients) return 0

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    for (const client of clients) {
      client.res.write(payload)
    }
    return clients.size
  }
}