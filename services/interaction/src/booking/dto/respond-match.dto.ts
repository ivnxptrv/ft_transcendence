import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class RespondMatchDto {
  @IsBoolean()
  accepted: boolean

  @IsOptional()
  @IsString()
  responseMessage?: string
}