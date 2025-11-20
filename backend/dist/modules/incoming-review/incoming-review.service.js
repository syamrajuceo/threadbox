"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var IncomingReviewService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingReviewService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const email_entity_1 = require("../emails/entities/email.entity");
const emails_service_1 = require("../emails/emails.service");
const email_processor_service_1 = require("../email-ingestion/processors/email-processor.service");
let IncomingReviewService = IncomingReviewService_1 = class IncomingReviewService {
    emailsRepository;
    emailsService;
    emailProcessor;
    logger = new common_1.Logger(IncomingReviewService_1.name);
    constructor(emailsRepository, emailsService, emailProcessor) {
        this.emailsRepository = emailsRepository;
        this.emailsService = emailsService;
        this.emailProcessor = emailProcessor;
    }
    async getUnassignedEmails(filters) {
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
            query.andWhere('(email.subject ILIKE :search OR email.fromAddress ILIKE :search OR email.body ILIKE :search)', { search: `%${filters.search}%` });
        }
        return query.getMany();
    }
    async assignToProject(emailId, projectId) {
        if (!projectId || projectId === '' || projectId === 'null' || projectId === 'undefined') {
            this.logger.log(`Unassigning email ${emailId} from project`);
            const updated = await this.emailsService.update(emailId, {
                projectId: null,
                isUnassigned: true,
                spamStatus: email_entity_1.EmailSpamStatus.POSSIBLE_SPAM,
            });
            this.logger.log(`Email ${emailId} unassigned. New projectId: ${updated.projectId}`);
            return updated;
        }
        this.logger.log(`Assigning email ${emailId} to project ${projectId}`);
        const updated = await this.emailsService.update(emailId, {
            projectId,
            isUnassigned: false,
            spamStatus: email_entity_1.EmailSpamStatus.NOT_SPAM,
        });
        this.logger.log(`Email ${emailId} assigned to project ${updated.projectId}`);
        return updated;
    }
    async assignToUser(emailId, userId) {
        return this.emailsService.update(emailId, {
            assignedToId: userId,
            isUnassigned: false,
        });
    }
    async markSpamStatus(emailId, spamStatus) {
        const email = await this.emailsService.findOne(emailId);
        const updateData = { spamStatus };
        if (spamStatus === email_entity_1.EmailSpamStatus.SPAM) {
            updateData.projectId = null;
            updateData.isUnassigned = false;
        }
        else if (spamStatus === email_entity_1.EmailSpamStatus.NOT_SPAM) {
            if (email.projectId) {
                updateData.isUnassigned = false;
            }
            else {
                updateData.spamStatus = email_entity_1.EmailSpamStatus.POSSIBLE_SPAM;
                updateData.isUnassigned = true;
            }
        }
        else if (spamStatus === email_entity_1.EmailSpamStatus.POSSIBLE_SPAM) {
            updateData.isUnassigned = true;
            if (email.projectId) {
                updateData.projectId = null;
            }
        }
        return this.emailsService.update(emailId, updateData);
    }
    async bulkAssignToProject(emailIds, projectId) {
        await this.emailsRepository
            .createQueryBuilder()
            .update(email_entity_1.Email)
            .set({
            projectId,
            isUnassigned: false,
            spamStatus: email_entity_1.EmailSpamStatus.NOT_SPAM,
        })
            .where('id IN (:...ids)', { ids: emailIds })
            .execute();
    }
    async processEmailWithAI(emailId) {
        const email = await this.emailsService.findOne(emailId);
        this.logger.log(`Processing email ${emailId} with AI`);
        return this.emailProcessor.processEmail(email);
    }
    async processEmailsWithAI(emailIds) {
        this.logger.log(`Processing ${emailIds.length} emails with AI`);
        let processed = 0;
        let failed = 0;
        for (const emailId of emailIds) {
            try {
                await this.processEmailWithAI(emailId);
                processed++;
            }
            catch (error) {
                this.logger.error(`Failed to process email ${emailId}:`, error);
                failed++;
            }
        }
        this.logger.log(`AI processing complete: ${processed} processed, ${failed} failed`);
        return { processed, failed };
    }
    async processAllUnprocessedEmails() {
        const unprocessedEmails = await this.emailsRepository.find({
            where: {
                spamStatus: email_entity_1.EmailSpamStatus.NOT_SPAM,
                aiSuggestedProjectId: (0, typeorm_2.IsNull)(),
            },
            take: 100,
        });
        if (unprocessedEmails.length === 0) {
            this.logger.log('No unprocessed emails found');
            return { processed: 0, failed: 0 };
        }
        this.logger.log(`Found ${unprocessedEmails.length} unprocessed emails`);
        const emailIds = unprocessedEmails.map((e) => e.id);
        return this.processEmailsWithAI(emailIds);
    }
};
exports.IncomingReviewService = IncomingReviewService;
exports.IncomingReviewService = IncomingReviewService = IncomingReviewService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(email_entity_1.Email)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        emails_service_1.EmailsService,
        email_processor_service_1.EmailProcessorService])
], IncomingReviewService);
//# sourceMappingURL=incoming-review.service.js.map