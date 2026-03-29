import { Module, forwardRef } from '@nestjs/common'
import { ChatService } from './chat.service'
import { ChatController } from './chat.controller'
import { ChatAdminController } from './admin.controller'
import { ChatInternalController } from './internal.controller'
import { ChatGateway } from './chat.gateway'
import { NotificationModule } from '../notification/notification.module'

@Module({
  imports: [NotificationModule],
  controllers: [ChatController, ChatAdminController, ChatInternalController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}