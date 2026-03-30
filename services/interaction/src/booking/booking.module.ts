import { Module } from '@nestjs/common'
import { BookingService } from './booking.service'
import { BookingController } from './booking.controller'
import { BookingAdminController } from './admin.controller'
import { BookingInternalController } from './internal.controller'
import { NotificationModule } from '../notification/notification.module'

@Module({
  imports: [NotificationModule],
  controllers: [BookingController, BookingAdminController, BookingInternalController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}