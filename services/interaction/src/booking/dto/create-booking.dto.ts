import { IsUUID, IsInt, IsOptional, IsDateString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateBookingDto {
  @IsUUID()
  searchRequestId: string

  @IsUUID()
  matchId: string

  @IsInt()
  @Min(15)
  @Type(() => Number)
  purchaseMinutes: number

  @IsOptional()
  @IsDateString()
  scheduledAt?: string
}