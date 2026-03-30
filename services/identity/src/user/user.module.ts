import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { UserInternalController } from './internal.controller'
import { AdminController } from './admin.controller'

@Module({
  controllers: [UserController, UserInternalController, AdminController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}