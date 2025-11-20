import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import {
  Email,
  EmailStatus,
  EmailSpamStatus,
} from '../emails/entities/email.entity';
import { Attachment } from '../emails/entities/attachment.entity';
import { EmailThread } from '../emails/entities/email-thread.entity';
import {
  IEmailProvider,
  EmailProviderConfig,
} from './interfaces/email-provider.interface';
import { GmailProvider } from './providers/gmail.provider';
import { OutlookProvider } from './providers/outlook.provider';
import { ImapProvider } from './providers/imap.provider';

@Injectable()
export class EmailIngestionService {
  private readonly logger = new Logger(EmailIngestionService.name);
  private readonly attachmentsDir: string;

  constructor(
    @InjectRepository(Email)
    private emailsRepository: Repository<Email>,
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
    @InjectRepository(EmailThread)
    private threadsRepository: Repository<EmailThread>,
    private configService: ConfigService,
  ) {
    this.attachmentsDir = path.join(process.cwd(), 'storage', 'attachments');
    if (!fs.existsSync(this.attachmentsDir)) {
      fs.mkdirSync(this.attachmentsDir, { recursive: true });
    }
  }

  private createProvider(config: EmailProviderConfig): IEmailProvider {
    switch (config.provider) {
      case 'gmail':
        return new GmailProvider(config);
      case 'outlook':
        return new OutlookProvider(config);
      case 'imap':
        return new ImapProvider(config);
      default:
        throw new Error(`Unsupported email provider: ${config.provider}`);
    }
  }

  async ingestEmails(
    config: EmailProviderConfig,
    since?: Date,
  ): Promise<number> {
    this.logger.log(
      `Starting email ingestion for provider: ${config.provider}, account: ${config.account}`,
    );
    if (since) {
      this.logger.log(
        `Date filter: Only fetching emails after ${since.toISOString()}`,
      );
    } else {
      this.logger.warn(
        '⚠️  No date filter provided - will fetch ALL emails (this may take a long time and use many API calls)',
      );
    }

    const provider = this.createProvider(config);
    let ingestedCount = 0;

    try {
      this.logger.log('Connecting to email provider...');
      await provider.connect();
      this.logger.log(
        'Fetching emails with date filter applied at API level...',
      );
      const messages = await provider.fetchEmails(since);
      this.logger.log(
        `Fetched ${messages.length} email(s) from provider (already filtered by date)`,
      );

      for (const message of messages) {
        try {
          // Check if email already exists
          const existing = await this.emailsRepository.findOne({
            where: {
              provider: config.provider,
              providerEmailId: message.id,
            },
          });

          if (existing) {
            continue; // Skip already ingested emails
          }

          // Create email entity
          const email = this.emailsRepository.create({
            subject: message.subject,
            body: message.body,
            bodyHtml: message.bodyHtml,
            fromAddress: message.fromAddress,
            fromName: message.fromName,
            toAddresses: message.toAddresses,
            ccAddresses: message.ccAddresses,
            bccAddresses: message.bccAddresses,
            receivedAt: message.receivedAt,
            messageId: message.messageId,
            inReplyTo: message.inReplyTo,
            references: message.references,
            provider: config.provider,
            providerEmailId: message.id,
            isUnassigned: true,
          });

          const savedEmail = await this.emailsRepository.save(email);

          // Handle attachments
          if (message.attachments && message.attachments.length > 0) {
            for (const att of message.attachments) {
              const filePath = await this.saveAttachment(
                savedEmail.id,
                att.filename,
                att.content,
              );

              await this.attachmentsRepository.save({
                email: savedEmail,
                filename: att.filename,
                contentType: att.contentType,
                size: att.size,
                filePath,
              });
            }
          }

          // AI processing is now done separately via the incoming review page
          // Mark as unassigned and set default status to POSSIBLE_SPAM until AI analysis
          savedEmail.isUnassigned = true;
          savedEmail.status = savedEmail.status || EmailStatus.OPEN;
          savedEmail.spamStatus = EmailSpamStatus.POSSIBLE_SPAM; // Default to possible spam until AI classifies
          savedEmail.spamConfidence = 0; // No confidence until AI analysis
          await this.emailsRepository.save(savedEmail);

          ingestedCount++;
        } catch (error) {
          this.logger.error(`Error ingesting email ${message.id}:`, error);
        }
      }

      await provider.disconnect();
    } catch (error) {
      this.logger.error('Error during email ingestion:', error);
      throw error;
    }

    return ingestedCount;
  }

  private saveAttachment(
    emailId: string,
    filename: string,
    content: Buffer,
  ): Promise<string> {
    const emailDir = path.join(this.attachmentsDir, emailId);
    if (!fs.existsSync(emailDir)) {
      fs.mkdirSync(emailDir, { recursive: true });
    }

    const filePath = path.join(emailDir, filename);
    fs.writeFileSync(filePath, content);

    return filePath;
  }
}
