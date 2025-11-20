import { IsArray, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { EmailStatus } from '../entities/email.entity';

export class BulkUpdateDto {
  @IsArray()
  @IsUUID('4', { each: true })
  emailIds: string[];

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsEnum(EmailStatus)
  status?: EmailStatus;
}

