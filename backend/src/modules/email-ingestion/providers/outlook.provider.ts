import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@microsoft/microsoft-graph-client';
import { IEmailProvider, EmailMessage, EmailAttachment } from '../interfaces/email-provider.interface';
import type { EmailProviderConfig } from '../interfaces/email-provider.interface';

@Injectable()
export class OutlookProvider implements IEmailProvider {
  private readonly logger = new Logger(OutlookProvider.name);
  private client: Client;
  private config: EmailProviderConfig;

  constructor(config: EmailProviderConfig) {
    this.config = config;
    this.client = Client.init({
      authProvider: (done) => {
        done(null, this.config.credentials.accessToken);
      },
    });
  }

  async connect(): Promise<void> {
    // Microsoft Graph client is initialized in constructor
  }

  async disconnect(): Promise<void> {
    // Microsoft Graph doesn't require explicit disconnection
  }

  async fetchEmails(since?: Date): Promise<EmailMessage[]> {
    let filter = '';
    if (since) {
      // Microsoft Graph API requires ISO 8601 format
      filter = `receivedDateTime ge ${since.toISOString()}`;
      this.logger.log(`Filtering emails after: ${since.toISOString()}`);
    } else {
      this.logger.log('No date filter provided - fetching ALL emails');
    }

    const allMessages: EmailMessage[] = [];
    let nextLink: string | undefined = undefined;
    const pageSize = 100;

    do {
      let request;
      
      if (nextLink) {
        // Use the nextLink directly for pagination
        // Extract the path from the full URL
        const url = new URL(nextLink);
        request = this.client.api(url.pathname + url.search);
      } else {
        // First page
        request = this.client
          .api('/me/messages')
          .top(pageSize)
          .orderby('receivedDateTime desc');
        
        if (filter) {
          request = request.filter(filter);
        }
      }

      const response = await request.get();
      const messages = response.value || [];
      allMessages.push(...messages.map((msg: Record<string, unknown>) => this.parseOutlookMessage(msg)));

      nextLink = response['@odata.nextLink'];
      
      if (nextLink) {
        console.log(`Fetched ${allMessages.length} emails so far, continuing...`);
      }
    } while (nextLink);

    return allMessages;
  }

  private parseOutlookMessage(message: Record<string, unknown>): EmailMessage {
    return {
      id: message.id,
      subject: message.subject || '',
      body: message.body?.content || '',
      bodyHtml: message.body?.contentType === 'html' ? message.body.content : '',
      fromAddress: message.from?.emailAddress?.address || '',
      fromName: message.from?.emailAddress?.name || '',
      toAddresses:
        message.toRecipients?.map((r: any) => r.emailAddress.address) || [],
      ccAddresses:
        message.ccRecipients?.map((r: any) => r.emailAddress.address) || [],
      bccAddresses:
        message.bccRecipients?.map((r: any) => r.emailAddress.address) || [],
      receivedAt: new Date(String(message.receivedDateTime)),
      messageId: message.internetMessageId || '',
      inReplyTo: message.internetMessageHeaders?.find(
        (h: any) => h.name === 'In-Reply-To',
      )?.value,
      references: message.internetMessageHeaders?.find(
        (h: any) => h.name === 'References',
      )?.value,
      attachments: message.hasAttachments
        ? message.attachments?.map((att: any) => ({
            filename: att.name,
            contentType: att.contentType,
            size: att.size,
            content: Buffer.from(String(att.contentBytes || ''), 'base64'),
          }))
        : [],
    };
  }

  async downloadAttachment(
    messageId: string,
    attachmentId: string,
  ): Promise<Buffer> {
    const attachment = await this.client
      .api(`/me/messages/${messageId}/attachments/${attachmentId}`)
      .get();

    return Buffer.from(String(attachment.contentBytes), 'base64');
  }
}

