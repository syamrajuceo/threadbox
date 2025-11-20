import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Email, EmailStatus, EmailSpamStatus } from '../../emails/entities/email.entity';
import { SpamClassifierService } from '../../ai/services/spam-classifier.service';
import { ProjectClassifierService } from '../../ai/services/project-classifier.service';
import { ClaudeProvider } from '../../ai/providers/claude.provider';
import { Project } from '../../projects/entities/project.entity';

@Injectable()
export class EmailProcessorService {
  private readonly logger = new Logger(EmailProcessorService.name);

  constructor(
    @InjectRepository(Email)
    private emailsRepository: Repository<Email>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private spamClassifier: SpamClassifierService,
    private projectClassifier: ProjectClassifierService,
    private aiProvider: ClaudeProvider,
  ) {}

  async processEmail(email: Email): Promise<Email> {
    try {
      const emailContent = `${email.subject || ''}\n\n${email.body || ''}`.trim();
      
      if (!emailContent || emailContent.length < 10) {
        this.logger.warn(`Email ${email.id} has insufficient content for classification`);
        // Mark as possible spam for manual review if content is insufficient
        email.spamStatus = EmailSpamStatus.POSSIBLE_SPAM;
        email.spamConfidence = 0;
        email.isUnassigned = true;
        email.projectId = null;
        email.aiSuggestedProjectId = null;
        return this.emailsRepository.save(email);
      }

      // Get projects for classification
      const projects = await this.projectsRepository.find();
      const projectDescriptions = projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        keywords: p.keywords || [],
      }));

      // Single combined AI call for both spam and project classification
      const combinedResult = await this.aiProvider.classifyCombined(
        emailContent,
        projectDescriptions,
      );

      // Set spam classification
      const spamCategory = combinedResult.spamClassification.category;
      email.spamConfidence = combinedResult.spamClassification.confidence;

      if (spamCategory === 'spam') {
        // Type 1: Spam - AI detected as spam
        email.spamStatus = EmailSpamStatus.SPAM;
        email.projectId = null;
        email.aiSuggestedProjectId = null;
        email.isUnassigned = false; // Spam emails are assigned (to spam category)
        this.logger.log(
          `Email ${email.id} classified as SPAM by AI (confidence: ${email.spamConfidence})`,
        );
      } else if (spamCategory === 'not_spam') {
        // Type 2: Not Spam - only mark as NOT_SPAM if project is found and auto-assigned
        const projectResult = combinedResult.projectClassification;
        email.aiSuggestedProjectId = projectResult.projectId;
        email.aiProjectConfidence = projectResult.confidence;

        // Only mark as NOT_SPAM if project is found with confidence >= 0.5
        if (
          projectResult.projectId &&
          projectResult.confidence >= 0.5
        ) {
          email.spamStatus = EmailSpamStatus.NOT_SPAM;
          email.projectId = projectResult.projectId;
          email.isUnassigned = false; // Auto-assigned to project
          this.logger.log(
            `Email ${email.id} classified as NOT_SPAM and auto-assigned to project ${projectResult.projectId} (confidence: ${projectResult.confidence})`,
          );
        } else {
          // No project match or low confidence - mark as possible spam for manual review
          email.spamStatus = EmailSpamStatus.POSSIBLE_SPAM;
          email.projectId = null;
          email.isUnassigned = true;
          this.logger.log(
            `Email ${email.id} marked as POSSIBLE_SPAM - no project match or low confidence. Project: ${projectResult.projectId || 'none'}, Confidence: ${projectResult.confidence}`,
          );
        }
      } else {
        // Type 3: Possible Spam or unknown - mark as possible spam for manual review
        // This includes: possible_spam category, classification failures, etc.
        email.spamStatus = EmailSpamStatus.POSSIBLE_SPAM;
        email.isUnassigned = true; // Needs manual review
        email.projectId = null;
        email.aiSuggestedProjectId = null;
        this.logger.log(
          `Email ${email.id} marked as POSSIBLE_SPAM for manual review (category: ${spamCategory}, confidence: ${email.spamConfidence})`,
        );
      }

      // Set default status
      if (!email.status) {
        email.status = EmailStatus.OPEN;
      }

      return this.emailsRepository.save(email);
    } catch (error) {
      this.logger.error(`Error processing email ${email.id}:`, error);
      // If classification fails, mark as possible spam for manual review
      email.spamStatus = EmailSpamStatus.POSSIBLE_SPAM;
      email.spamConfidence = 0;
      email.isUnassigned = true;
      email.projectId = null;
      email.aiSuggestedProjectId = null;
      return this.emailsRepository.save(email);
    }
  }

  async processBatch(emails: Email[]): Promise<Email[]> {
    const processed: Email[] = [];
    for (const email of emails) {
      try {
        const processedEmail = await this.processEmail(email);
        processed.push(processedEmail);
      } catch (error) {
        this.logger.error(`Error processing email ${email.id} in batch:`, error);
      }
    }
    return processed;
  }
}

