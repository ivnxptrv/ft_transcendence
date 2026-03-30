import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class ExtendSessionDto {
  @IsInt()
  @Min(15)
  @Type(() => Number)
  minutes: number
}