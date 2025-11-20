import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { IEmailProvider, EmailMessage, EmailAttachment } from '../interfaces/email-provider.interface';
import type { EmailProviderConfig } from '../interfaces/email-provider.interface';

@Injectable()
export class GmailProvider implements IEmailProvider {
  private readonly logger = new Logger(GmailProvider.name);
  private gmail: any;
  private config: EmailProviderConfig;
  
  // Rate limiting constants
  // Gmail API allows ~50 requests/second (250 quota units/sec, 5 units per request)
  // We'll use ~30 requests/second to stay safely under the limit
  private readonly REQUESTS_PER_SECOND = 30;
  private readonly DELAY_BETWEEN_BATCHES_MS = 500; // 500ms delay between batches (faster)
  private readonly DELAY_BETWEEN_REQUESTS_MS = 35; // ~28 requests/second (safe margin)
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY_MS = 2000; // 2 seconds

  constructor(config: EmailProviderConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        this.config.credentials.clientId,
        this.config.credentials.clientSecret,
        this.config.credentials.redirectUri,
      );

      oauth2Client.setCredentials({
        refresh_token: this.config.credentials.refreshToken,
      });

      // Try to refresh the token to validate credentials
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);

      this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    } catch (error: any) {
      if (error.message?.includes('unauthorized_client') || error.code === 401) {
        throw new Error(
          'OAuth unauthorized_client error. Please verify:\n' +
          '1. The redirect URI matches exactly what is configured in Google Cloud Console\n' +
          '2. The redirect URI used to obtain the refresh token matches the one you entered\n' +
          '3. The client ID and client secret are correct\n' +
          '4. The Gmail API is enabled in your Google Cloud project\n' +
          `Current redirect URI: ${this.config.credentials.redirectUri}`
        );
      }
      
      // Handle quota errors with helpful message
      if (
        error.message?.includes('Quota exceeded') ||
        error.message?.includes('quota') ||
        error.code === 429 ||
        error.response?.status === 429
      ) {
        throw new Error(
          'Gmail API quota exceeded. Please wait a few minutes before trying again.\n' +
          'The system will automatically retry with delays, but you may need to:\n' +
          '1. Wait 1-2 minutes before retrying\n' +
          '2. Reduce the number of emails being fetched by using a "since" date\n' +
          '3. Request a quota increase in Google Cloud Console if needed'
        );
      }
      
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    // Gmail API doesn't require explicit disconnection
  }

  async fetchEmails(since?: Date): Promise<EmailMessage[]> {
    // Gmail API: The 'after:' operator with date format (YYYY/MM/DD) interprets dates as midnight PST
    // For accurate timezone handling, use Unix timestamp in seconds
    let query = '';
    if (since) {
      // Convert to Unix timestamp (seconds since epoch) for accurate timezone handling
      const unixTimestamp = Math.floor(since.getTime() / 1000);
      query = `after:${unixTimestamp}`;
      this.logger.log(`📧 Gmail: Filtering emails after Unix timestamp: ${unixTimestamp}`);
      this.logger.log(`   Original date: ${since.toISOString()}`);
      this.logger.log(`   UTC date: ${since.toUTCString()}`);
      this.logger.log(`   Query string: ${query}`);
    } else {
      this.logger.warn('⚠️  Gmail: No date filter provided - fetching ALL emails');
    }

    const emailMessages: EmailMessage[] = [];
    let pageToken: string | undefined = undefined;
    const batchSize = 100; // Increased back to 100 for better performance

    do {
      // Fetch message list with retry logic
      const response = await this.retryWithBackoff(
        () => {
          const requestParams = {
            userId: 'me',
            q: query,
            maxResults: batchSize,
            ...(pageToken && { pageToken }),
          };
          this.logger.debug(`Gmail API request: q="${query}", maxResults=${batchSize}, pageToken=${pageToken ? 'present' : 'none'}`);
          return this.gmail.users.messages.list(requestParams);
        },
        'list messages'
      ) as any; // Type assertion needed for Gmail API response

      const messages = response.data.messages || [];
      pageToken = response.data.nextPageToken;
      
      if (messages.length > 0) {
        this.logger.log(`Fetched ${messages.length} messages (total so far: ${emailMessages.length + messages.length})`);
      }

      if (messages.length === 0) {
        break;
      }

      // Process messages in larger parallel batches with controlled rate limiting
      // Gmail allows ~50 requests/second, we'll use ~28 requests/second for safety
      const sequentialBatchSize = 25; // Process 25 at a time (increased from 10)
      for (let i = 0; i < messages.length; i += sequentialBatchSize) {
        const batch = messages.slice(i, i + sequentialBatchSize);
        
        // Process batch with controlled parallel execution and rate limiting
        const batchPromises = batch.map(async (message: any, index: number) => {
          // Add small delay between requests to respect rate limits
          // This gives us ~28 requests/second (1000ms / 35ms = ~28)
          if (index > 0) {
            await this.delay(this.DELAY_BETWEEN_REQUESTS_MS);
          }

          return this.retryWithBackoff(
            async () => {
              const fullMessage = await this.gmail.users.messages.get({
                userId: 'me',
                id: message.id,
                format: 'full',
              });
              return this.parseGmailMessage(fullMessage.data);
            },
            `fetch message ${message.id}`
          );
        });

        const batchResults = await Promise.all(batchPromises);
        const validEmails = batchResults.filter((email) => email !== null) as EmailMessage[];
        emailMessages.push(...validEmails);

        // Log progress
        this.logger.debug(`Fetched ${emailMessages.length} emails so far...`);

        // Shorter delay between batches (reduced from 1000ms to 500ms)
        if (i + sequentialBatchSize < messages.length) {
          await this.delay(this.DELAY_BETWEEN_BATCHES_MS);
        }
      }

      // Shorter delay before fetching next page
      if (pageToken) {
        this.logger.debug(`Fetched ${emailMessages.length} emails, fetching next page...`);
        await this.delay(this.DELAY_BETWEEN_BATCHES_MS);
      }
    } while (pageToken);

    this.logger.log(`Successfully fetched ${emailMessages.length} emails from Gmail`);
    return emailMessages;
  }

  /**
   * Retry a function with exponential backoff on quota errors
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    operation: string,
    retries = this.MAX_RETRIES
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a quota error
        const isQuotaError = 
          error.message?.includes('Quota exceeded') ||
          error.message?.includes('quota') ||
          error.code === 429 ||
          error.response?.status === 429;

        if (isQuotaError && attempt < retries) {
          const delay = this.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
          this.logger.warn(
            `Quota error for ${operation}, retrying in ${delay}ms (attempt ${attempt + 1}/${retries + 1})`
          );
          await this.delay(delay);
          continue;
        }

        // For non-quota errors or final attempt, throw immediately
        if (!isQuotaError || attempt === retries) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private parseGmailMessage(message: any): EmailMessage | null {
    try {
      const headers = message.payload.headers;
      const getHeader = (name: string) =>
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())
          ?.value || '';

      const subject = getHeader('subject');
      const from = getHeader('from');
      const to = getHeader('to');
      const cc = getHeader('cc');
      const date = getHeader('date');
      const messageId = getHeader('message-id');
      const inReplyTo = getHeader('in-reply-to');
      const references = getHeader('references');

      // Parse body
      const bodyData = { body: '', bodyHtml: '' };
      this.extractBody(message.payload, bodyData);

      // Parse from address
      const fromMatch = from.match(/^(.+?)\s*<(.+?)>$|^(.+?)$/);
      const fromName = fromMatch
        ? fromMatch[1] || fromMatch[3] || ''
        : '';
      const fromAddress = fromMatch
        ? fromMatch[2] || fromMatch[3] || from
        : from;

      // Parse attachments
      const attachments: EmailAttachment[] = [];
      this.extractAttachments(message.payload, attachments);

      return {
        id: message.id,
        subject,
        body: bodyData.body || bodyData.bodyHtml.replace(/<[^>]*>/g, ''),
        bodyHtml: bodyData.bodyHtml || bodyData.body,
        fromAddress,
        fromName,
        toAddresses: to.split(',').map((e: string) => e.trim()),
        ccAddresses: cc ? cc.split(',').map((e: string) => e.trim()) : [],
        bccAddresses: [],
        receivedAt: new Date(date || message.internalDate),
        messageId,
        inReplyTo,
        references,
        attachments,
      };
    } catch (error) {
      this.logger.error('Error parsing Gmail message:', error);
      return null;
    }
  }

  private extractBody(part: any, bodyData: { body: string; bodyHtml: string }): void {
    if (part.body?.data) {
      const content = Buffer.from(String(part.body.data), 'base64').toString();
      if (part.mimeType === 'text/html') {
        bodyData.bodyHtml = content;
      } else if (part.mimeType === 'text/plain') {
        bodyData.body = content;
      }
    }

    if (part.parts) {
      for (const subPart of part.parts) {
        this.extractBody(subPart, bodyData);
      }
    }
  }

  private extractAttachments(part: any, attachments: EmailAttachment[]): void {
    if (part.filename && part.body?.attachmentId) {
      attachments.push({
        filename: part.filename,
        contentType: part.mimeType,
        size: part.body.size || 0,
        content: Buffer.alloc(0), // Will be downloaded separately
      });
    }

    if (part.parts) {
      for (const subPart of part.parts) {
        this.extractAttachments(subPart, attachments);
      }
    }
  }

  async downloadAttachment(
    messageId: string,
    attachmentId: string,
  ): Promise<Buffer> {
    const response = await this.gmail.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId,
    });

    return Buffer.from(String(response.data.data), 'base64');
  }
}

