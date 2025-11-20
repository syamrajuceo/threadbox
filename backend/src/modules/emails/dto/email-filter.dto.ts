import { IsOptional, IsEnum, IsString, IsDateString, IsUUID } from 'class-validator';
import { EmailStatus } from '../entities/email.entity';

export class EmailFilterDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsEnum(EmailStatus)
  status?: EmailStatus;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  isUnassigned?: boolean | string;
}

