import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Email, EmailSpamStatus } from '../emails/entities/email.entity';
import { EmailsService } from '../emails/emails.service';
import { EmailProcessorService } from '../email-ingestion/processors/email-processor.service';

@Injectable()
export class IncomingReviewService {
  private readonly logger = new Logger(IncomingReviewService.name);

  constructor(
    @InjectRepository(Email)
    private emailsRepository: Repository<Email>,
    private emailsService: EmailsService,
    private emailProcessor: EmailProcessorService,
  ) {}

  async getUnassignedEmails(filters?: {
    spamStatus?: EmailSpamStatus;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
  }) {
    // Show all emails, not just unassigned ones
    // This allows Super User to see all emails including assigned ones
    const query = this.emailsRepository
      .createQueryBuilder('email')
      .leftJoinAndSelect('email.project', 'project')
      .leftJoinAndSelect('email.assignedTo', 'assignedTo')
      .orderBy('email.receivedAt', 'DESC');

    if (filters?.spamStatus) {
      query.andWhere('email.spamStatus = :spamStatus', {
        spamStatus: filters.spamStatus,
      });
    }

    if (filters?.dateFrom) {
      query.andWhere('email.receivedAt >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters?.dateTo) {
      query.andWhere('email.receivedAt <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    if (filters?.search) {
      query.andWhere(
        '(email.subject ILIKE :search OR email.fromAddress ILIKE :search OR email.body ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return query.getMany();
  }

  async assignToProject(emailId: string, projectId: string) {
    // Update project assignment but keep email visible in review
    // If projectId is empty, null, or undefined, unassign the email
    if (!projectId || projectId === '' || projectId === 'null' || projectId === 'undefined') {
      this.logger.log(`Unassigning email ${emailId} from project`);
      // Unassigning from project - mark as possible spam for review
      const updated = await this.emailsService.update(emailId, {
        projectId: null,
        isUnassigned: true,
        spamStatus: EmailSpamStatus.POSSIBLE_SPAM, // Default to possible spam when unassigned
      });
      this.logger.log(`Email ${emailId} unassigned. New projectId: ${updated.projectId}`);
      return updated;
    }
    this.logger.log(`Assigning email ${emailId} to project ${projectId}`);
    // Admin assigned to project - mark as NOT_SPAM since it's project-related
    const updated = await this.emailsService.update(emailId, {
      projectId,
      isUnassigned: false,
      spamStatus: EmailSpamStatus.NOT_SPAM, // Admin assigned = project-related = not spam
    });
    this.logger.log(`Email ${emailId} assigned to project ${updated.projectId}`);
    return updated;
  }

  async assignToUser(emailId: string, userId: string) {
    return this.emailsService.update(emailId, {
      assignedToId: userId,
      isUnassigned: false,
    });
  }

  async markSpamStatus(emailId: string, spamStatus: EmailSpamStatus) {
    // Get current email to check if project is assigned
    const email = await this.emailsService.findOne(emailId);
    
    const updateData: any = { spamStatus };
    
    if (spamStatus === EmailSpamStatus.SPAM) {
      // Admin marked as spam - clear project assignment
      updateData.projectId = null;
      updateData.isUnassigned = false; // Assigned to spam category
    } else if (spamStatus === EmailSpamStatus.NOT_SPAM) {
      // Admin marked as not spam - only set as NOT_SPAM if project is assigned
      // If no project, keep as POSSIBLE_SPAM until project is assigned
      if (email.projectId) {
        // Project is assigned - mark as NOT_SPAM
        updateData.isUnassigned = false;
      } else {
        // No project assigned - keep as POSSIBLE_SPAM (don't change to NOT_SPAM)
        updateData.spamStatus = EmailSpamStatus.POSSIBLE_SPAM;
        updateData.isUnassigned = true;
      }
    } else if (spamStatus === EmailSpamStatus.POSSIBLE_SPAM) {
      // Admin marked as possible spam - mark as unassigned
      updateData.isUnassigned = true;
      // Clear project if assigned
      if (email.projectId) {
        updateData.projectId = null;
      }
    }
    
    return this.emailsService.update(emailId, updateData);
  }

  async bulkAssignToProject(emailIds: string[], projectId: string) {
    // Admin bulk assigned to project - mark as NOT_SPAM since they're project-related
    const updateData: Partial<Email> = { 
      projectId, 
      isUnassigned: false,
      spamStatus: EmailSpamStatus.NOT_SPAM, // Admin assigned = project-related = not spam
    };
    await this.emailsRepository
      .createQueryBuilder()
      .update(Email)
      .set(updateData)
      .where('id IN (:...ids)', { ids: emailIds })
      .execute();
  }

  /**
   * Process a single email with AI (spam classification and project routing)
   */
  async processEmailWithAI(emailId: string): Promise<Email> {
    const email = await this.emailsService.findOne(emailId);
    this.logger.log(`Processing email ${emailId} with AI`);
    return this.emailProcessor.processEmail(email);
  }

  /**
   * Process multiple emails with AI (batch processing)
   */
  async processEmailsWithAI(emailIds: string[]): Promise<{ processed: number; failed: number }> {
    this.logger.log(`Processing ${emailIds.length} emails with AI`);
    let processed = 0;
    let failed = 0;

    for (const emailId of emailIds) {
      try {
        await this.processEmailWithAI(emailId);
        processed++;
      } catch (error) {
        this.logger.error(`Failed to process email ${emailId}:`, error);
        failed++;
      }
    }

    this.logger.log(`AI processing complete: ${processed} processed, ${failed} failed`);
    return { processed, failed };
  }

  /**
   * Process all unprocessed emails (emails that haven't been classified yet)
   */
  async processAllUnprocessedEmails(): Promise<{ processed: number; failed: number }> {
    // Find emails that haven't been processed (spamStatus is NOT_SPAM and no AI suggestions)
    const unprocessedEmails = await this.emailsRepository.find({
      where: {
        spamStatus: EmailSpamStatus.NOT_SPAM,
        aiSuggestedProjectId: IsNull(),
      },
      take: 100, // Process in batches of 100
    });

    if (unprocessedEmails.length === 0) {
      this.logger.log('No unprocessed emails found');
      return { processed: 0, failed: 0 };
    }

    this.logger.log(`Found ${unprocessedEmails.length} unprocessed emails`);
    const emailIds = unprocessedEmails.map((e) => e.id);
    return this.processEmailsWithAI(emailIds);
  }
}

