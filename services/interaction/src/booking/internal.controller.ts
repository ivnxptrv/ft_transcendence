import { Controller, Patch, Param, HttpCode } from '@nestjs/common'
import { BookingService } from './booking.service'

@Controller('internal/booking')
export class BookingInternalController {
  constructor(private readonly bookingService: BookingService) {}

  @Patch(':bookingId/complete')
  @HttpCode(200)
  async markCompleted(@Param('bookingId') bookingId: string) {
    return this.bookingService.markCompleted(bookingId)
  }

  @Patch(':bookingId/refunded')
  @HttpCode(200)
  async markRefunded(@Param('bookingId') bookingId: string) {
    return this.bookingService.markRefunded(bookingId)
  }
}