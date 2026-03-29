import { IsString, IsOptional, IsEnum, IsUUID, IsObject } from 'class-validator'

export enum NotificationChannel {
  in_app = 'in_app',
  sse = 'sse',
  websocket = 'websocket',
}

export enum NotificationSeverity {
  info = 'info',
  warning = 'warning',
  critical = 'critical',
}

export class SendNotificationDto {
  @IsUUID()
  userId: string

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

  @IsOptional()
  @IsString()
  referenceId?: string

  @IsOptional()
  @IsString()
  referenceType?: string
}