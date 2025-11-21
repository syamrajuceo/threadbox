import { IEmailProvider, EmailMessage } from '../interfaces/email-provider.interface';
import type { EmailProviderConfig } from '../interfaces/email-provider.interface';
export declare class ImapProvider implements IEmailProvider {
    private readonly logger;
    private imap;
    private config;
    constructor(config: EmailProviderConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    fetchEmails(since?: Date): Promise<EmailMessage[]>;
}
