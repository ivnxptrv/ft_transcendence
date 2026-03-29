import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { BookingService } from './booking.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { AdminGuard } from '../common/guards/admin.guard'

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class BookingAdminController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('bookings')
  async getAllBookings(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('providerId') providerId?: string,
  ) {
    return this.bookingService.getAllBookings({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      customerId,
      providerId,
    })
  }

  @Get('search-requests')
  async getAllSearchRequests(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    return this.bookingService.getAllSearchRequests({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    })
  }
}