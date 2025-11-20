import { IsEnum, IsString, IsOptional } from 'class-validator';
import { EscalationStatus } from '../entities/escalation.entity';

export class ReviewEscalationDto {
  @IsEnum(EscalationStatus)
  status: EscalationStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
