export interface EmailMessage {
  id: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  fromAddress: string;
  fromName: string;
  toAddresses: string[];
  ccAddresses: string[];
  bccAddresses: string[];
  receivedAt: Date;
  messageId: string;
  inReplyTo?: string;
  references?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  content: Buffer;
}

export interface EmailProviderConfig {
  provider: string;
  account: string;
  credentials: Record<string, unknown>;
}

export interface IEmailProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  fetchEmails(since?: Date): Promise<EmailMessage[]>;
  downloadAttachment(messageId: string, attachmentId: string): Promise<Buffer>;
}
