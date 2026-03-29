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
import { BookingService } from './booking.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CreateSearchRequestDto } from './dto/create-search-request.dto'
import { RespondMatchDto } from './dto/respond-match.dto'
import { CreateBookingDto } from './dto/create-booking.dto'
import { CancelBookingDto } from './dto/cancel-booking.dto'
import type { Request } from 'express'

@Controller('booking')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('search')
  async createSearchRequest(@Req() req: Request, @Body() dto: CreateSearchRequestDto) {
    const user = req.user as any
    return this.bookingService.createSearchRequest(user.userId, dto)
  }

  @Get('search/history')
  async getSearchHistory(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    const user = req.user as any
    return this.bookingService.getSearchHistory(user.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    })
  }

  @Get('search/:searchRequestId')
  async getSearchRequest(
    @Param('searchRequestId') searchRequestId: string,
    @Req() req: Request,
  ) {
    const user = req.user as any
    return this.bookingService.getSearchRequest(searchRequestId, user.userId)
  }

  @Post('search/:searchRequestId/more')
  @HttpCode(200)
  async loadMore(
    @Param('searchRequestId') searchRequestId: string,
    @Req() req: Request,
  ) {
    const user = req.user as any
    return this.bookingService.loadMoreProviders(searchRequestId, user.userId)
  }

  @Post('matches/:matchId/respond')
  @HttpCode(200)
  async respondToMatch(
    @Param('matchId') matchId: string,
    @Req() req: Request,
    @Body() dto: RespondMatchDto,
  ) {
    const user = req.user as any
    return this.bookingService.respondToMatch(matchId, user.userId, dto)
  }

  @Get('matches/pending')
  async getPendingMatches(@Req() req: Request) {
    const user = req.user as any
    return this.bookingService.getPendingMatches(user.userId)
  }

  @Post()
  async createBooking(@Req() req: Request, @Body() dto: CreateBookingDto) {
    const user = req.user as any
    return this.bookingService.createBooking(user.userId, dto)
  }

  @Get('customer/history')
  async getCustomerBookings(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    const user = req.user as any
    return this.bookingService.getCustomerBookings(user.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    })
  }

  @Get('provider/history')
  async getProviderBookings(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    const user = req.user as any
    return this.bookingService.getProviderBookings(user.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    })
  }

  @Get(':bookingId')
  async getBooking(@Param('bookingId') bookingId: string, @Req() req: Request) {
    const user = req.user as any
    return this.bookingService.getBooking(bookingId, user.userId)
  }

  @Post(':bookingId/accept')
  @HttpCode(200)
  async acceptBooking(@Param('bookingId') bookingId: string, @Req() req: Request) {
    const user = req.user as any
    return this.bookingService.acceptBooking(bookingId, user.userId)
  }

  @Post(':bookingId/reject')
  @HttpCode(200)
  async rejectBooking(
    @Param('bookingId') bookingId: string,
    @Req() req: Request,
    @Body() body: { reason?: string },
  ) {
    const user = req.user as any
    return this.bookingService.rejectBooking(bookingId, user.userId, body.reason)
  }

  @Post(':bookingId/cancel')
  @HttpCode(200)
  async cancelBooking(
    @Param('bookingId') bookingId: string,
    @Req() req: Request,
    @Body() dto: CancelBookingDto,
  ) {
    const user = req.user as any
    return this.bookingService.cancelBooking(bookingId, user.userId, dto)
  }
}