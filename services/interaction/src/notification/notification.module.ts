import { Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { NotificationController } from './notification.controller'
import { NotificationInternalController } from './internal.controller'
import { NotificationGateway } from './notification.gateway'

@Module({
  controllers: [NotificationController, NotificationInternalController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}