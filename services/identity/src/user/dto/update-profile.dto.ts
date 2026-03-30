import { IsString, IsOptional } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsString()
  displayName?: string

  @IsOptional()
  @IsString()
  bio?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  country?: string

  @IsOptional()
  @IsString()
  city?: string
}