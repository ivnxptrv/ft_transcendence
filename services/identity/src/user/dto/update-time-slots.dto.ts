import { IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { TimeSlotDto } from './create-provider-profile.dto'

export class UpdateTimeSlotsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  timeSlots: TimeSlotDto[]
}