import { IsEnum } from 'class-validator';
import { EmailStatus } from '../../emails/entities/email.entity';

export class UpdateEmailStatusDto {
  @IsEnum(EmailStatus)
  status: EmailStatus;
}
