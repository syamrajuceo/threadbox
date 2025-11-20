import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum EmailProvider {
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
  IMAP = 'imap',
}

@ValidatorConstraint({ name: 'credentials', async: false })
export class CredentialsValidator implements ValidatorConstraintInterface {
  validate(credentials: unknown, args: ValidationArguments) {
    const dto = args.object as IngestEmailsDto;

    if (!credentials || typeof credentials !== 'object') {
      return false;
    }

    const creds = credentials as Record<string, unknown>;

    switch (dto.provider) {
      case EmailProvider.GMAIL:
        return (
          typeof creds.clientId === 'string' &&
          typeof creds.clientSecret === 'string' &&
          typeof creds.redirectUri === 'string' &&
          typeof creds.refreshToken === 'string'
        );
      case EmailProvider.OUTLOOK:
        return (
          typeof creds.clientId === 'string' &&
          typeof creds.clientSecret === 'string' &&
          typeof creds.redirectUri === 'string' &&
          typeof creds.accessToken === 'string'
        );
      case EmailProvider.IMAP:
        return (
          typeof creds.username === 'string' &&
          typeof creds.password === 'string' &&
          typeof creds.host === 'string'
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
  @Transform(({ value }: { value: unknown }) => {
    if (!value) return undefined;
    const date =
      typeof value === 'string' || typeof value === 'number'
        ? new Date(value)
        : value;
    return date instanceof Date ? date : undefined;
  })
  since?: Date;
}
