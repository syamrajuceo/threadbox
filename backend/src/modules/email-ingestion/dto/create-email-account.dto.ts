import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { EmailProvider } from '../entities/email-account.entity';

export class CreateEmailAccountDto {
  @IsString()
  name: string;

  @IsEnum(EmailProvider)
  provider: EmailProvider;

  @IsString()
  account: string;

  @IsObject()
  credentials: any; // Will be encrypted - object with provider-specific fields

  @IsOptional()
  @IsString()
  redirectUri?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
