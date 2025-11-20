import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum EmailProvider {
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
  IMAP = 'imap',
}

@ValidatorConstraint({ name: 'credentials', async: false })
export class CredentialsValidator implements ValidatorConstraintInterface {
  validate(credentials: any, args: ValidationArguments) {
    const dto = args.object as IngestEmailsDto;
    
    if (!credentials || typeof credentials !== 'object') {
      return false;
    }

    switch (dto.provider) {
      case EmailProvider.GMAIL:
        return (
          typeof credentials.clientId === 'string' &&
          typeof credentials.clientSecret === 'string' &&
          typeof credentials.redirectUri === 'string' &&
          typeof credentials.refreshToken === 'string'
        );
      case EmailProvider.OUTLOOK:
        return (
          typeof credentials.clientId === 'string' &&
          typeof credentials.clientSecret === 'string' &&
          typeof credentials.redirectUri === 'string' &&
          typeof credentials.accessToken === 'string'
        );
      case EmailProvider.IMAP:
        return (
          typeof credentials.username === 'string' &&
          typeof credentials.password === 'string' &&
          typeof credentials.host === 'string'
        );
      default:
        return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const dto = args.object as IngestEmailsDto;
    switch (dto.provider) {
      case EmailProvider.GMAIL:
        return 'Gmail credentials must include clientId, clientSecret, redirectUri, and refreshToken';
      case EmailProvider.OUTLOOK:
        return 'Outlook credentials must include clientId, clientSecret, redirectUri, and accessToken';
      case EmailProvider.IMAP:
        return 'IMAP credentials must include username, password, and host';
      default:
        return 'Invalid credentials format';
    }
  }
}

export class IngestEmailsDto {
  @IsEnum(EmailProvider)
  provider: EmailProvider;

  @IsString()
  account: string;

  @IsObject()
  @Validate(CredentialsValidator)
  credentials: Record<string, unknown>;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
    return date instanceof Date ? date : undefined;
  })
  since?: Date;
}

