import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@microsoft/microsoft-graph-client';
import {
  IEmailProvider,
  EmailMessage,
} from '../interfaces/email-provider.interface';
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

      const response = (await request.get()) as {
        value?: Record<string, unknown>[];
        '@odata.nextLink'?: string;
      };
      const messages = response.value || [];
      allMessages.push(
        ...messages.map((msg: Record<string, unknown>) =>
          this.parseOutlookMessage(msg),
        ),
      );

      nextLink = response['@odata.nextLink'];

      if (nextLink) {
        console.log(
          `Fetched ${allMessages.length} emails so far, continuing...`,
        );
      }
    } while (nextLink);

    return allMessages;
  }

  private parseOutlookMessage(message: Record<string, unknown>): EmailMessage {
    const body = message.body as
      | { content?: string; contentType?: string }
      | undefined;
    const from = message.from as
      | { emailAddress?: { address?: string; name?: string } }
      | undefined;
    const toRecipients = message.toRecipients as
      | Array<{ emailAddress?: { address?: string } }>
      | undefined;
    const ccRecipients = message.ccRecipients as
      | Array<{ emailAddress?: { address?: string } }>
      | undefined;
    const bccRecipients = message.bccRecipients as
      | Array<{ emailAddress?: { address?: string } }>
      | undefined;
    const headers = message.internetMessageHeaders as
      | Array<{ name?: string; value?: string }>
      | undefined;
    const attachments = message.attachments as
      | Array<{
          name?: string;
          contentType?: string;
          size?: number;
          contentBytes?: string;
        }>
      | undefined;

    return {
      id: String(message.id || ''),
      subject: String(message.subject || ''),
      body: body?.content || '',
      bodyHtml: body?.contentType === 'html' ? body.content || '' : '',
      fromAddress: from?.emailAddress?.address || '',
      fromName: from?.emailAddress?.name || '',
      toAddresses:
        toRecipients
          ?.map((r) => r.emailAddress?.address || '')
          .filter((addr): addr is string => Boolean(addr)) || [],
      ccAddresses:
        ccRecipients
          ?.map((r) => r.emailAddress?.address || '')
          .filter((addr): addr is string => Boolean(addr)) || [],
      bccAddresses:
        bccRecipients
          ?.map((r) => r.emailAddress?.address || '')
          .filter((addr): addr is string => Boolean(addr)) || [],
      receivedAt: new Date(String(message.receivedDateTime || Date.now())),
      messageId: String(message.internetMessageId || ''),
      inReplyTo: headers?.find((h) => h.name === 'In-Reply-To')?.value || '',
      references: headers?.find((h) => h.name === 'References')?.value || '',
      attachments:
        message.hasAttachments && attachments
          ? attachments.map((att) => ({
              filename: att.name || 'attachment',
              contentType: att.contentType || 'application/octet-stream',
              size: att.size || 0,
              content: Buffer.from(String(att.contentBytes || ''), 'base64'),
            }))
          : [],
    };
  }

  async downloadAttachment(
    messageId: string,
    attachmentId: string,
  ): Promise<Buffer> {
    const attachment = (await this.client
      .api(`/me/messages/${messageId}/attachments/${attachmentId}`)
      .get()) as { contentBytes?: string };

    return Buffer.from(String(attachment.contentBytes || ''), 'base64');
  }
}
