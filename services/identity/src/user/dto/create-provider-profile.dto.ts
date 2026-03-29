import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class TimeSlotDto {
  @IsString()
  day: string

  @IsString()
  startTime: string

  @IsString()
  endTime: string
}

export class CreateProviderProfileDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  hourlyRate: number

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[]

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  yearsExperience?: number

  @IsOptional()
  @IsArray()
  timeSlots?: TimeSlotDto[]
}