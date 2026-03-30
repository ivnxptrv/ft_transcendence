import { IsString, MinLength } from 'class-validator'

export class CreateSearchRequestDto {
  @IsString()
  @MinLength(10)
  query: string
}