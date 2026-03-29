import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateProviderProfileDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  hourlyRate?: number

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
  @IsBoolean()
  isAvailable?: boolean
}