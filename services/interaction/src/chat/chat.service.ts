import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { NotificationService } from '../notification/notification.service'
import { ChatGateway } from './chat.gateway'
import { ConfigService } from '@nestjs/config'
import { ExtendSessionDto } from './dto/extend-session.dto'
import { NotificationChannel } from '../notification/dto/send-notification.dto'
import axios from 'axios'
import { forwardRef, Inject } from '@nestjs/common'

@Injectable()
export class ChatService {
  private sessionTimers = new Map<string, ReturnType<typeof setInterval>>()
  private sessionState = new Map<string, { timeRemaining: number; status: string }>()

  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly gateway: ChatGateway,
  ) {}

  // SESSION

  async getSession(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { extensions: true },
    })

    if (!session) throw new NotFoundException('Session not found')
    if (session.customerId !== userId && session.providerId !== userId) {
      throw new ForbiddenException()
    }

    const liveState = this.sessionState.get(sessionId)
    return {
      ...session,
      timeRemaining: liveState?.timeRemaining ?? session.timeRemaining,
      status: liveState?.status ?? session.status,
    }
  }

  async extendSession(sessionId: string, userId: string, dto: ExtendSessionDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) throw new NotFoundException('Session not found')
    if (session.customerId !== userId) {
      throw new ForbiddenException('Only customer can extend session')
    }

    const state = this.sessionState.get(sessionId)
    if (!state || state.status !== 'active') {
      throw new BadRequestException('Session is not active')
    }

    const cost = Math.round((Number(session.hourlyRate) / 60) * dto.minutes)

    await this.callLedgerExtend(userId, cost, sessionId)

    await this.prisma.sessionExtension.create({
      data: { sessionId, minutes: dto.minutes, cost },
    })

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { totalMinutes: { increment: dto.minutes } },
    })

    const newTimeRemaining = (state.timeRemaining ?? 0) + dto.minutes * 60
    this.sessionState.set(sessionId, { ...state, timeRemaining: newTimeRemaining })

    this.gateway.emitToSession(sessionId, 'session_extended', {
      sessionId,
      addedMinutes: dto.minutes,
      timeRemaining: newTimeRemaining,
    })

    return {
      sessionId,
      addedMinutes: dto.minutes,
      totalMinutes: session.totalMinutes + dto.minutes,
      cost,
      timeRemaining: newTimeRemaining,
    }
  }

  async pauseSession(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) throw new NotFoundException('Session not found')
    if (session.providerId !== userId) {
      throw new ForbiddenException('Only provider can pause session')
    }

    const state = this.sessionState.get(sessionId)
    if (!state || state.status !== 'active') {
      throw new BadRequestException('Session is not active')
    }

    this.stopTimer(sessionId)
    this.sessionState.set(sessionId, { ...state, status: 'paused' })

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'paused', pausedAt: new Date() },
    })

    this.gateway.emitToSession(sessionId, 'session_paused', { sessionId })

    return { sessionId, status: 'paused', timeRemaining: state.timeRemaining }
  }

  async resumeSession(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) throw new NotFoundException('Session not found')
    if (session.providerId !== userId) {
      throw new ForbiddenException('Only provider can resume session')
    }

    const state = this.sessionState.get(sessionId)
    if (!state || state.status !== 'paused') {
      throw new BadRequestException('Session is not paused')
    }

    this.sessionState.set(sessionId, { ...state, status: 'active' })
    this.startTimer(sessionId)

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'active', pausedAt: null },
    })

    this.gateway.emitToSession(sessionId, 'session_resumed', {
      sessionId,
      timeRemaining: state.timeRemaining,
    })

    return { sessionId, status: 'active', timeRemaining: state.timeRemaining }
  }

  async endSessionSatisfied(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) throw new NotFoundException('Session not found')
    if (session.customerId !== userId) {
      throw new ForbiddenException('Only customer can end session as satisfied')
    }

    const state = this.sessionState.get(sessionId)
    if (!state || !['active', 'paused'].includes(state.status)) {
      throw new BadRequestException('Session is not active')
    }

    return this.finalizeSession(sessionId, 'ended_satisfied', state.timeRemaining ?? 0)
  }

  async getSessionHistory(
    userId: string,
    role: 'customer' | 'provider',
    params: { page: number; limit: number; status?: string },
  ) {
    const { page, limit, status } = params
    const skip = (page - 1) * limit

    const where: any = role === 'customer' ? { customerId: userId } : { providerId: userId }
    if (status) where.status = status

    const [data, total] = await Promise.all([
      this.prisma.session.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { extensions: true },
      }),
      this.prisma.session.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  // MESSAGES

  async getMessages(
    sessionId: string,
    userId: string,
    params: { page: number; limit: number; before?: string },
  ) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } })
    if (!session) throw new NotFoundException('Session not found')
    if (session.customerId !== userId && session.providerId !== userId) {
      throw new ForbiddenException()
    }

    const { page, limit, before } = params
    const skip = (page - 1) * limit

    const where: any = { sessionId }
    if (before) where.createdAt = { lt: new Date(before) }

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.message.count({ where }),
    ])

    return {
      data,
      total,
      page,
      limit,
      hasMore: skip + data.length < total,
    }
  }

  async saveMessage(data: {
    sessionId: string
    senderId: string
    content?: string
    type: 'text' | 'file' | 'system'
    fileUrl?: string
    fileName?: string
    fileSize?: number
  }) {
    const session = await this.prisma.session.findUnique({
      where: { id: data.sessionId },
    })

    if (!session) throw new NotFoundException('Session not found')

    const senderRole =
      data.senderId === session.customerId
        ? 'customer'
        : data.senderId === session.providerId
          ? 'provider'
          : 'system'

    return this.prisma.message.create({
      data: {
        sessionId: data.sessionId,
        senderId: data.senderId,
        senderRole: senderRole as any,
        type: data.type,
        content: data.content,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
      },
    })
  }

  async markMessageRead(messageId: string) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    })
  }

  // CONNECTION HANDLING

  async handleUserConnected(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) return

    if (session.status === 'pending') {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { status: 'active', startedAt: new Date() },
      })

      const timeRemaining = session.purchasedMinutes * 60
      this.sessionState.set(sessionId, { timeRemaining, status: 'active' })
      this.startTimer(sessionId)

      this.gateway.emitToSession(sessionId, 'session_active', { sessionId })

      await this.addSystemMessage(sessionId, `Session started — ${session.purchasedMinutes} minutes purchased`)
    }

    const role = userId === session.customerId ? 'customer' : 'provider'
    this.gateway.emitToSession(sessionId, 'partner_reconnected', { userId, role })
  }

  async handleUserDisconnected(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) return

    const role = userId === session.customerId ? 'customer' : 'provider'
    this.gateway.emitToSession(sessionId, 'partner_disconnected', { userId, role })
  }

  // ADMIN

  async getAllSessions(params: {
    page: number
    limit: number
    status?: string
    customerId?: string
    providerId?: string
  }) {
    const { page, limit, status, customerId, providerId } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (customerId) where.customerId = customerId
    if (providerId) where.providerId = providerId

    const [data, total] = await Promise.all([
      this.prisma.session.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { extensions: true },
      }),
      this.prisma.session.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async getActiveSessions() {
    const sessions = await this.prisma.session.findMany({
      where: { status: { in: ['active', 'paused'] } },
      include: { extensions: true },
    })

    return sessions.map((s) => ({
      ...s,
      timeRemaining: this.sessionState.get(s.id)?.timeRemaining ?? s.timeRemaining,
    }))
  }

  async forceEndSession(sessionId: string, reason?: string) {
    const state = this.sessionState.get(sessionId)
    return this.finalizeSession(sessionId, 'ended_forced', state?.timeRemaining ?? 0)
  }

  // INTERNAL

  async createSession(data: {
    bookingId: string
    customerId: string
    providerId: string
    hourlyRate: number
    purchasedMinutes: number
  }) {
    const session = await this.prisma.session.create({
      data: {
        bookingId: data.bookingId,
        customerId: data.customerId,
        providerId: data.providerId,
        hourlyRate: data.hourlyRate,
        purchasedMinutes: data.purchasedMinutes,
        totalMinutes: data.purchasedMinutes,
      },
    })

    return { sessionId: session.id }
  }

  async getSessionById(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { extensions: true },
    })

    if (!session) throw new NotFoundException('Session not found')

    const liveState = this.sessionState.get(sessionId)
    return {
      ...session,
      timeRemaining: liveState?.timeRemaining ?? session.timeRemaining,
      status: liveState?.status ?? session.status,
    }
  }

  // HELPERS — TIMER

  private startTimer(sessionId: string) {
    const timer = setInterval(async () => {
      const state = this.sessionState.get(sessionId)
      if (!state || state.status !== 'active') return

      const newTime = state.timeRemaining - 1
      this.sessionState.set(sessionId, { ...state, timeRemaining: newTime })
      this.gateway.emitTick(sessionId, newTime)

      if (newTime === 300) {
        this.gateway.emitToSession(sessionId, 'session_warning', {
          sessionId,
          timeRemaining: newTime,
        })
      }

      if (newTime <= 0) {
        this.stopTimer(sessionId)
        await this.finalizeSession(sessionId, 'ended_timeout', 0)
      }
    }, 1000)

    this.sessionTimers.set(sessionId, timer)
  }

  private stopTimer(sessionId: string) {
    const timer = this.sessionTimers.get(sessionId)
    if (timer) {
      clearInterval(timer)
      this.sessionTimers.delete(sessionId)
    }
  }

  private async finalizeSession(
    sessionId: string,
    endStatus: string,
    timeRemaining: number,
  ) {
    this.stopTimer(sessionId)
    this.sessionState.delete(sessionId)

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) throw new NotFoundException('Session not found')

    const minutesUsed = session.totalMinutes - Math.floor(timeRemaining / 60)
    const totalCost = Math.round((Number(session.hourlyRate) / 60) * minutesUsed)
    const providerEarning = Math.round(totalCost * 0.95)
    const platformFee = totalCost - providerEarning
    const refundAmount = Math.round((Number(session.hourlyRate) / 60) * Math.floor(timeRemaining / 60))

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: endStatus as any,
        endedAt: new Date(),
        timeRemaining,
        totalCost,
        providerEarning,
        platformFee,
      },
    })

    await this.prisma.booking.update({
      where: { id: session.bookingId },
      data: { status: endStatus === 'ended_forced' ? 'completed' : 'completed' },
    })

    await this.callLedgerTransfer(
      session.customerId,
      session.providerId,
      totalCost,
      sessionId,
      refundAmount,
    )

    await this.callLedgerTriggerReview(sessionId, session.customerId, session.providerId)

    const summary = { sessionId, status: endStatus, totalCost, providerEarning, platformFee, refundAmount }

    this.gateway.emitToSession(sessionId, 'session_ended', summary)

    await this.notification.send({
      userId: session.customerId,
      type: 'session_ended',
      title: 'Session Ended',
      body: `Your session has ended. Total cost: ${totalCost} pts.`,
      channel: NotificationChannel.websocket,
      data: summary,
    })

    await this.notification.send({
      userId: session.providerId,
      type: 'session_ended',
      title: 'Session Ended',
      body: `Session completed. You earned ${providerEarning} pts.`,
      channel: NotificationChannel.websocket,
      data: summary,
    })

    return summary
  }

  private async addSystemMessage(sessionId: string, content: string) {
    return this.prisma.message.create({
      data: {
        sessionId,
        senderId: 'system',
        senderRole: 'system',
        type: 'system',
        content,
      },
    })
  }

  // HELPERS — INTER-SERVICE

  private async callLedgerExtend(userId: string, amount: number, sessionId: string) {
    try {
      await axios.post(`${this.config.get('LEDGER_SERVICE_URL')}/internal/wallet/extend`, {
        userId,
        amount,
        sessionId,
      })
    } catch (err) {
      console.error('Failed to extend payment:', err.message)
    }
  }

  private async callLedgerTransfer(
    customerId: string,
    providerId: string,
    totalAmount: number,
    sessionId: string,
    refundAmount: number,
  ) {
    try {
      await axios.post(`${this.config.get('LEDGER_SERVICE_URL')}/internal/wallet/transfer`, {
        customerId,
        providerId,
        totalAmount,
        sessionId,
        refundAmount,
      })
    } catch (err) {
      console.error('Failed to transfer funds:', err.message)
    }
  }

  private async callLedgerTriggerReview(
    sessionId: string,
    customerId: string,
    providerId: string,
  ) {
    try {
      await axios.post(`${this.config.get('LEDGER_SERVICE_URL')}/internal/reviews/prompt`, {
        sessionId,
        customerId,
        providerId,
      })
    } catch (err) {
      console.error('Failed to trigger review:', err.message)
    }
  }
}