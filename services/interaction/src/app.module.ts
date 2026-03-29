import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { NotificationModule } from './notification/notification.module'
import { BookingModule } from './booking/booking.module'
import { ChatModule } from './chat/chat.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    NotificationModule,
    BookingModule,
    ChatModule,
  ],
})
export class AppModule {}