import { ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare enum EmailProvider {
    GMAIL = "gmail",
    OUTLOOK = "outlook",
    IMAP = "imap"
}
export declare class CredentialsValidator implements ValidatorConstraintInterface {
    validate(credentials: any, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): "Gmail credentials must include clientId, clientSecret, redirectUri, and refreshToken" | "Outlook credentials must include clientId, clientSecret, redirectUri, and accessToken" | "IMAP credentials must include username, password, and host" | "Invalid credentials format";
}
export declare class IngestEmailsDto {
    provider: EmailProvider;
    account: string;
    credentials: any;
    since?: Date;
}
