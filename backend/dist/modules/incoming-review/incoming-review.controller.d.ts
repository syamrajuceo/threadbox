import { IncomingReviewService } from './incoming-review.service';
import { EmailSpamStatus } from '../emails/entities/email.entity';
export declare class IncomingReviewController {
    private readonly incomingReviewService;
    constructor(incomingReviewService: IncomingReviewService);
    getUnassignedEmails(spamStatus?: EmailSpamStatus, dateFrom?: string, dateTo?: string, search?: string): Promise<import("../emails/entities/email.entity").Email[]>;
    assignToProject(id: string, projectId?: string | null): Promise<import("../emails/entities/email.entity").Email>;
    assignToUser(id: string, userId: string): Promise<import("../emails/entities/email.entity").Email>;
    markSpamStatus(id: string, spamStatus: EmailSpamStatus): Promise<import("../emails/entities/email.entity").Email>;
    bulkAssignToProject(emailIds: string[], projectId: string): Promise<void>;
    processEmailWithAI(id: string): Promise<import("../emails/entities/email.entity").Email>;
    processEmailsWithAI(emailIds: string[]): Promise<{
        processed: number;
        failed: number;
    }>;
    processAllUnprocessedEmails(): Promise<{
        processed: number;
        failed: number;
    }>;
}
