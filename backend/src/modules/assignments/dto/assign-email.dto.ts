import { IsUUID, IsOptional } from 'class-validator';

export class AssignEmailDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;
}

