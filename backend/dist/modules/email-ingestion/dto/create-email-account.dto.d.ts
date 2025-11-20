import { EmailProvider } from '../entities/email-account.entity';
export declare class CreateEmailAccountDto {
    name: string;
    provider: EmailProvider;
    account: string;
    credentials: any;
    redirectUri?: string;
    isActive?: boolean;
}
