import { IEmailProvider, EmailMessage } from '../interfaces/email-provider.interface';
import type { EmailProviderConfig } from '../interfaces/email-provider.interface';
export declare class OutlookProvider implements IEmailProvider {
    private readonly logger;
    private client;
    private config;
    constructor(config: EmailProviderConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    fetchEmails(since?: Date): Promise<EmailMessage[]>;
    private parseOutlookMessage;
    downloadAttachment(messageId: string, attachmentId: string): Promise<Buffer>;
}
