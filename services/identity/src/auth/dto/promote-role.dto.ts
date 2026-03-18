import { IsUUID } from 'class-validator'

export class PromoteRoleDto {
  @IsUUID()
  userId: string
}