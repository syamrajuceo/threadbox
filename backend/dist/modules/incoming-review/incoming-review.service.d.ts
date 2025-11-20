import { Repository } from 'typeorm';
import { Email, EmailSpamStatus } from '../emails/entities/email.entity';
import { EmailsService } from '../emails/emails.service';
import { EmailProcessorService } from '../email-ingestion/processors/email-processor.service';
export declare class IncomingReviewService {
    private emailsRepository;
    private emailsService;
    private emailProcessor;
    private readonly logger;
    constructor(emailsRepository: Repository<Email>, emailsService: EmailsService, emailProcessor: EmailProcessorService);
    getUnassignedEmails(filters?: {
        spamStatus?: EmailSpamStatus;
        dateFrom?: Date;
        dateTo?: Date;
        search?: string;
    }): Promise<Email[]>;
    assignToProject(emailId: string, projectId: string): Promise<Email>;
    assignToUser(emailId: string, userId: string): Promise<Email>;
    markSpamStatus(emailId: string, spamStatus: EmailSpamStatus): Promise<Email>;
    bulkAssignToProject(emailIds: string[], projectId: string): Promise<void>;
    processEmailWithAI(emailId: string): Promise<Email>;
    processEmailsWithAI(emailIds: string[]): Promise<{
        processed: number;
        failed: number;
    }>;
    processAllUnprocessedEmails(): Promise<{
        processed: number;
        failed: number;
    }>;
}
