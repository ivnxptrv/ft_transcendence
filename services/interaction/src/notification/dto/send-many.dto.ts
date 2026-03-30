import { IsString, IsOptional, IsEnum, IsArray, IsUUID, IsObject } from 'class-validator'
import { NotificationChannel, NotificationSeverity } from './send-notification.dto'

export class SendManyNotificationDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  userIds: string[]

  @IsString()
  type: string

  @IsString()
  title: string

  @IsString()
  body: string

  @IsEnum(NotificationChannel)
  channel: NotificationChannel

  @IsOptional()
  @IsEnum(NotificationSeverity)
  severity?: NotificationSeverity

  @IsOptional()
  @IsObject()
  data?: Record<string, any>
}