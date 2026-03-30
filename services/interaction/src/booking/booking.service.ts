import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { NotificationService } from '../notification/notification.service'
import { ConfigService } from '@nestjs/config'
import { CreateSearchRequestDto } from './dto/create-search-request.dto'
import { RespondMatchDto } from './dto/respond-match.dto'
import { CreateBookingDto } from './dto/create-booking.dto'
import { CancelBookingDto } from './dto/cancel-booking.dto'
import { NotificationChannel } from '../notification/dto/send-notification.dto'
import axios from 'axios'

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
    private readonly config: ConfigService,
  ) {}

  // SEARCH

  async createSearchRequest(customerId: string, dto: CreateSearchRequestDto) {
    const windowMinutes = 30
    const windowExpiresAt = new Date(Date.now() + windowMinutes * 60 * 1000)

    const searchRequest = await this.prisma.searchRequest.create({
      data: {
        customerId,
        query: dto.query,
        windowExpiresAt,
      },
    })

    const providers = await this.callSemanticSearch(
      dto.query,
      searchRequest.id,
      customerId,
      10,
      0,
    )

    if (providers.length > 0) {
      await this.prisma.match.createMany({
        data: providers.map((p: any) => ({
          searchRequestId: searchRequest.id,
          providerId: p.providerId,
          similarityScore: p.similarityScore,
          batch: 1,
        })),
      })

      await this.prisma.searchRequest.update({
        where: { id: searchRequest.id },
        data: { totalNotified: providers.length },
      })

      await this.notification.sendMany({
        userIds: providers.map((p: any) => p.providerId),
        type: 'match_found',
        title: 'New Service Request',
        body: `A customer is looking for your services: "${dto.query.substring(0, 100)}"`,
        channel: NotificationChannel.websocket,
        data: { searchRequestId: searchRequest.id },
      })
    }

    this.scheduleWindowExpiry(searchRequest.id, windowMinutes)

    return {
      searchRequestId: searchRequest.id,
      windowExpiresAt,
      totalNotified: providers.length,
    }
  }

  async getSearchRequest(searchRequestId: string, customerId: string) {
    const searchRequest = await this.prisma.searchRequest.findUnique({
      where: { id: searchRequestId },
      include: {
        matches: {
          where: { status: 'responded' },
          orderBy: { similarityScore: 'desc' },
        },
      },
    })

    if (!searchRequest) throw new NotFoundException('Search request not found')
    if (searchRequest.customerId !== customerId) throw new ForbiddenException()

    return searchRequest
  }

  async loadMoreProviders(searchRequestId: string, customerId: string) {
    const searchRequest = await this.prisma.searchRequest.findUnique({
      where: { id: searchRequestId },
      include: { matches: true },
    })

    if (!searchRequest) throw new NotFoundException('Search request not found')
    if (searchRequest.customerId !== customerId) throw new ForbiddenException()
    if (searchRequest.status !== 'active') {
      throw new BadRequestException('Search window is no longer active')
    }
    if (new Date() > searchRequest.windowExpiresAt) {
      throw new BadRequestException('Search window has expired')
    }

    const existingProviderIds = searchRequest.matches.map((m) => m.providerId)
    const currentBatch = Math.max(...searchRequest.matches.map((m) => m.batch), 0)

    const providers = await this.callSemanticSearch(
      searchRequest.query,
      searchRequestId,
      customerId,
      10,
      existingProviderIds.length,
      existingProviderIds,
    )

    if (providers.length === 0) {
      return { totalNotified: searchRequest.totalNotified, hasMore: false }
    }

    await this.prisma.match.createMany({
      data: providers.map((p: any) => ({
        searchRequestId,
        providerId: p.providerId,
        similarityScore: p.similarityScore,
        batch: currentBatch + 1,
      })),
    })

    await this.prisma.searchRequest.update({
      where: { id: searchRequestId },
      data: { totalNotified: { increment: providers.length } },
    })

    await this.notification.sendMany({
      userIds: providers.map((p: any) => p.providerId),
      type: 'match_found',
      title: 'New Service Request',
      body: `A customer is looking for your services: "${searchRequest.query.substring(0, 100)}"`,
      channel: NotificationChannel.websocket,
      data: { searchRequestId },
    })

    return {
      totalNotified: searchRequest.totalNotified + providers.length,
      hasMore: providers.length === 10,
    }
  }

  async getSearchHistory(
    customerId: string,
    params: { page: number; limit: number; status?: string },
  ) {
    const { page, limit, status } = params
    const skip = (page - 1) * limit

    const where: any = { customerId }
    if (status) where.status = status

    const [data, total] = await Promise.all([
      this.prisma.searchRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { matches: true } } },
      }),
      this.prisma.searchRequest.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  // MATCH RESPONSE

  async respondToMatch(matchId: string, providerId: string, dto: RespondMatchDto) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { searchRequest: true },
    })

    if (!match) throw new NotFoundException('Match not found')
    if (match.providerId !== providerId) throw new ForbiddenException()
    if (match.status !== 'notified') {
      throw new BadRequestException('Already responded to this match')
    }
    if (match.searchRequest.status !== 'active') {
      throw new BadRequestException('Search window is no longer active')
    }
    if (new Date() > match.searchRequest.windowExpiresAt) {
      throw new BadRequestException('Search window has expired')
    }

    if (!dto.accepted) {
      await this.prisma.match.update({
        where: { id: matchId },
        data: { status: 'rejected', respondedAt: new Date() },
      })
      return { matchId, status: 'rejected' }
    }

    const updatedMatch = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'responded',
        responseMessage: dto.responseMessage,
        respondedAt: new Date(),
      },
    })

    await this.notification.send({
      userId: match.searchRequest.customerId,
      type: 'provider_responded',
      title: 'Provider Responded',
      body: dto.responseMessage ?? 'A provider has responded to your request',
      channel: NotificationChannel.websocket,
      data: { matchId, searchRequestId: match.searchRequestId },
    })

    this.notification.pushSseEvent(match.searchRequestId, 'provider_responded', {
      matchId,
      providerId,
      responseMessage: dto.responseMessage,
      similarityScore: match.similarityScore,
    })

    return { matchId, status: 'responded' }
  }

  async getPendingMatches(providerId: string) {
    return this.prisma.match.findMany({
      where: {
        providerId,
        status: 'notified',
        searchRequest: {
          status: 'active',
          windowExpiresAt: { gt: new Date() },
        },
      },
      include: { searchRequest: true },
      orderBy: { notifiedAt: 'desc' },
    })
  }

  // BOOKING

  async createBooking(customerId: string, dto: CreateBookingDto) {
    const searchRequest = await this.prisma.searchRequest.findUnique({
      where: { id: dto.searchRequestId },
    })

    if (!searchRequest) throw new NotFoundException('Search request not found')
    if (searchRequest.customerId !== customerId) throw new ForbiddenException()
    if (searchRequest.status === 'booked') {
      throw new ConflictException('Search request already booked')
    }

    const match = await this.prisma.match.findUnique({
      where: { id: dto.matchId },
    })

    if (!match) throw new NotFoundException('Match not found')
    if (match.status !== 'responded') {
      throw new BadRequestException('Provider has not responded to this match')
    }

    await this.callLedgerLockFunds(customerId, match.providerId, dto.purchaseMinutes, dto.searchRequestId)

    const [booking] = await this.prisma.$transaction([
      this.prisma.booking.create({
        data: {
          searchRequestId: dto.searchRequestId,
          customerId,
          providerId: match.providerId,
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        },
      }),
      this.prisma.searchRequest.update({
        where: { id: dto.searchRequestId },
        data: { status: 'booked' },
      }),
    ])

    await this.notification.send({
      userId: match.providerId,
      type: 'booking_created',
      title: 'New Booking Request',
      body: 'A customer has booked your service. Please accept or reject.',
      channel: NotificationChannel.websocket,
      data: { bookingId: booking.id },
    })

    return booking
  }

  async getBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { searchRequest: true, session: true },
    })

    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.customerId !== userId && booking.providerId !== userId) {
      throw new ForbiddenException()
    }

    return booking
  }

  async acceptBooking(bookingId: string, providerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.providerId !== providerId) throw new ForbiddenException()
    if (booking.status !== 'pending') {
      throw new BadRequestException('Booking is not in pending status')
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'accepted' },
    })

    const session = await this.createSession(booking)

    await this.notification.send({
      userId: booking.customerId,
      type: 'booking_accepted',
      title: 'Booking Accepted',
      body: 'Your booking has been accepted. Your session is ready.',
      channel: NotificationChannel.websocket,
      data: { bookingId, sessionId: session.id },
    })

    return { bookingId, sessionId: session.id }
  }

  async rejectBooking(bookingId: string, providerId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.providerId !== providerId) throw new ForbiddenException()
    if (booking.status !== 'pending') {
      throw new BadRequestException('Booking is not in pending status')
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'rejected', cancelledBy: 'provider', cancellationReason: reason },
    })

    await this.callLedgerUnlockFunds(booking.customerId, booking.searchRequestId)

    await this.notification.send({
      userId: booking.customerId,
      type: 'booking_rejected',
      title: 'Booking Rejected',
      body: 'Your booking has been rejected. Your funds have been returned.',
      channel: NotificationChannel.websocket,
      data: { bookingId },
    })

    return { bookingId, status: 'rejected' }
  }

  async cancelBooking(bookingId: string, userId: string, dto: CancelBookingDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.customerId !== userId && booking.providerId !== userId) {
      throw new ForbiddenException()
    }
    if (!['pending', 'accepted'].includes(booking.status)) {
      throw new BadRequestException('Cannot cancel booking in current status')
    }

    const cancelledBy = booking.customerId === userId ? 'customer' : 'provider'

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        cancelledBy: cancelledBy as any,
        cancellationReason: dto.reason,
      },
    })

    await this.callLedgerUnlockFunds(booking.customerId, booking.searchRequestId)

    const notifyUserId =
      cancelledBy === 'customer' ? booking.providerId : booking.customerId

    await this.notification.send({
      userId: notifyUserId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      body: 'A booking has been cancelled. Funds have been returned.',
      channel: NotificationChannel.websocket,
      data: { bookingId },
    })

    return { bookingId, status: 'cancelled' }
  }

  async getCustomerBookings(
    customerId: string,
    params: { page: number; limit: number; status?: string },
  ) {
    const { page, limit, status } = params
    const skip = (page - 1) * limit

    const where: any = { customerId }
    if (status) where.status = status

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { session: true },
      }),
      this.prisma.booking.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async getProviderBookings(
    providerId: string,
    params: { page: number; limit: number; status?: string },
  ) {
    const { page, limit, status } = params
    const skip = (page - 1) * limit

    const where: any = { providerId }
    if (status) where.status = status

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { session: true },
      }),
      this.prisma.booking.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  // ADMIN

  async getAllBookings(params: {
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
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { session: true },
      }),
      this.prisma.booking.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async getAllSearchRequests(params: {
    page: number
    limit: number
    status?: string
  }) {
    const { page, limit, status } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status

    const [data, total] = await Promise.all([
      this.prisma.searchRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { matches: true } } },
      }),
      this.prisma.searchRequest.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  // INTERNAL

  async markCompleted(bookingId: string) {
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'completed' },
    })
  }

  async markRefunded(bookingId: string) {
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'refunded' },
    })
  }

  // HELPERS

  private async createSession(booking: any) {
    const providerProfile = await this.callIdentityGetProvider(booking.providerId)
    const hourlyRate = providerProfile?.hourlyRate ?? 500

    return this.prisma.session.create({
      data: {
        bookingId: booking.id,
        customerId: booking.customerId,
        providerId: booking.providerId,
        hourlyRate,
        purchasedMinutes: 60,
        totalMinutes: 60,
      },
    })
  }

  private scheduleWindowExpiry(searchRequestId: string, minutes: number) {
    setTimeout(async () => {
      const sr = await this.prisma.searchRequest.findUnique({
        where: { id: searchRequestId },
        include: { _count: { select: { matches: { where: { status: 'responded' } } } } },
      })

      if (!sr || sr.status !== 'active') return

      await this.prisma.searchRequest.update({
        where: { id: searchRequestId },
        data: { status: 'expired' },
      })

      await this.prisma.match.updateMany({
        where: { searchRequestId, status: 'notified' },
        data: { status: 'ignored' },
      })

      if (sr._count.matches === 0) {
        await this.notification.send({
          userId: sr.customerId,
          type: 'match_no_response',
          title: 'No Providers Responded',
          body: 'Unfortunately no providers responded to your request. Please try again.',
          channel: NotificationChannel.websocket,
          data: { searchRequestId },
        })

        this.notification.pushSseEvent(searchRequestId, 'no_response', { searchRequestId })
      } else {
        this.notification.pushSseEvent(searchRequestId, 'window_expired', {
          searchRequestId,
          totalResponses: sr._count.matches,
        })
      }
    }, minutes * 60 * 1000)
  }

  private async callSemanticSearch(
    query: string,
    searchRequestId: string,
    customerId: string,
    limit: number,
    offset: number,
    excludeProviderIds: string[] = [],
  ) {
    try {
      const res = await axios.post(
        `${this.config.get('SEMANTIC_SERVICE_URL')}/search`,
        { query, searchRequestId, customerId, limit, offset, excludeProviderIds },
      )
      return res.data.results ?? []
    } catch (err) {
      console.error('Semantic search failed:', err.message)
      return []
    }
  }

  private async callLedgerLockFunds(
    customerId: string,
    providerId: string,
    minutes: number,
    referenceId: string,
  ) {
    try {
      await axios.post(`${this.config.get('LEDGER_SERVICE_URL')}/internal/wallet/lock`, {
        userId: customerId,
        amount: minutes,
        referenceId,
      })
    } catch (err) {
      console.error('Failed to lock funds:', err.message)
    }
  }

  private async callLedgerUnlockFunds(customerId: string, referenceId: string) {
    try {
      await axios.post(`${this.config.get('LEDGER_SERVICE_URL')}/internal/wallet/unlock`, {
        userId: customerId,
        referenceId,
      })
    } catch (err) {
      console.error('Failed to unlock funds:', err.message)
    }
  }

  private async callIdentityGetProvider(providerId: string) {
    try {
      const res = await axios.get(
        `${this.config.get('IDENTITY_SERVICE_URL')}/internal/users/${providerId}/basic`,
      )
      return res.data
    } catch (err) {
      console.error('Failed to get provider info:', err.message)
      return null
    }
  }
}