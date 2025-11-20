import { IEmailProvider, EmailMessage } from '../interfaces/email-provider.interface';
import type { EmailProviderConfig } from '../interfaces/email-provider.interface';
export declare class GmailProvider implements IEmailProvider {
    private readonly logger;
    private gmail;
    private config;
    private readonly REQUESTS_PER_SECOND;
    private readonly DELAY_BETWEEN_BATCHES_MS;
    private readonly DELAY_BETWEEN_REQUESTS_MS;
    private readonly MAX_RETRIES;
    private readonly INITIAL_RETRY_DELAY_MS;
    constructor(config: EmailProviderConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    fetchEmails(since?: Date): Promise<EmailMessage[]>;
    private retryWithBackoff;
    private delay;
    private parseGmailMessage;
    private extractBody;
    private extractAttachments;
    downloadAttachment(messageId: string, attachmentId: string): Promise<Buffer>;
}
