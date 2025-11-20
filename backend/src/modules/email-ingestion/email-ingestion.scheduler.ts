import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { EmailIngestionService } from './email-ingestion.service';

@Injectable()
export class EmailIngestionScheduler {
  private readonly logger = new Logger(EmailIngestionScheduler.name);

  constructor(
    private readonly emailIngestionService: EmailIngestionService,
    private readonly configService: ConfigService,
  ) {}

  // Run every 15 minutes (using cron expression: */15 * * * *)
  @Cron('*/15 * * * *')
  async handleEmailIngestion() {
    this.logger.log('Starting scheduled email ingestion...');

    try {
      // Get email accounts from configuration
      const emailAccounts = this.getEmailAccountsFromConfig();

      for (const account of emailAccounts) {
        try {
          const count = await this.emailIngestionService.ingestEmails(
            account,
            this.getLastIngestionDate(account.account),
          );
          this.logger.log(
            `Ingested ${count} emails from ${account.account} (${account.provider})`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to ingest emails from ${account.account}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in scheduled email ingestion:', error);
    }
  }

  private getEmailAccountsFromConfig(): any[] {
    // This should be configured in your .env or a database table
    // For now, return empty array - you'll need to configure this
    const accounts: any[] = [];

    // Example: Read from environment variables
    // You can store multiple accounts as JSON in env or use a database
    const gmailAccounts = this.configService.get<string>('GMAIL_ACCOUNTS');
    if (gmailAccounts) {
      try {
        const parsed = JSON.parse(gmailAccounts);
        accounts.push(...parsed);
      } catch (e) {
        this.logger.warn('Failed to parse GMAIL_ACCOUNTS from config');
      }
    }

    return accounts;
  }

  private getLastIngestionDate(account: string): Date | undefined {
    // In a production system, you'd store the last ingestion date per account
    // For now, return undefined to fetch all emails (or last 24 hours)
    const hoursAgo = 24;
    return new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  }
}

