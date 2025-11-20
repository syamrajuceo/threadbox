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
var EmailProcessorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProcessorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const email_entity_1 = require("../../emails/entities/email.entity");
const spam_classifier_service_1 = require("../../ai/services/spam-classifier.service");
const project_classifier_service_1 = require("../../ai/services/project-classifier.service");
const claude_provider_1 = require("../../ai/providers/claude.provider");
const project_entity_1 = require("../../projects/entities/project.entity");
let EmailProcessorService = EmailProcessorService_1 = class EmailProcessorService {
    emailsRepository;
    projectsRepository;
    spamClassifier;
    projectClassifier;
    aiProvider;
    logger = new common_1.Logger(EmailProcessorService_1.name);
    constructor(emailsRepository, projectsRepository, spamClassifier, projectClassifier, aiProvider) {
        this.emailsRepository = emailsRepository;
        this.projectsRepository = projectsRepository;
        this.spamClassifier = spamClassifier;
        this.projectClassifier = projectClassifier;
        this.aiProvider = aiProvider;
    }
    async processEmail(email) {
        try {
            const emailContent = `${email.subject || ''}\n\n${email.body || ''}`.trim();
            if (!emailContent || emailContent.length < 10) {
                this.logger.warn(`Email ${email.id} has insufficient content for classification`);
                email.spamStatus = email_entity_1.EmailSpamStatus.POSSIBLE_SPAM;
                email.spamConfidence = 0;
                email.isUnassigned = true;
                email.projectId = null;
                email.aiSuggestedProjectId = null;
                return this.emailsRepository.save(email);
            }
            const projects = await this.projectsRepository.find();
            const projectDescriptions = projects.map((p) => ({
                id: p.id,
                name: p.name,
                description: p.description || '',
                keywords: p.keywords || [],
            }));
            const combinedResult = await this.aiProvider.classifyCombined(emailContent, projectDescriptions);
            const spamCategory = combinedResult.spamClassification.category;
            email.spamConfidence = combinedResult.spamClassification.confidence;
            if (spamCategory === 'spam') {
                email.spamStatus = email_entity_1.EmailSpamStatus.SPAM;
                email.projectId = null;
                email.aiSuggestedProjectId = null;
                email.isUnassigned = false;
                this.logger.log(`Email ${email.id} classified as SPAM by AI (confidence: ${email.spamConfidence})`);
            }
            else if (spamCategory === 'not_spam') {
                const projectResult = combinedResult.projectClassification;
                email.aiSuggestedProjectId = projectResult.projectId;
                email.aiProjectConfidence = projectResult.confidence;
                if (projectResult.projectId &&
                    projectResult.confidence >= 0.5) {
                    email.spamStatus = email_entity_1.EmailSpamStatus.NOT_SPAM;
                    email.projectId = projectResult.projectId;
                    email.isUnassigned = false;
                    this.logger.log(`Email ${email.id} classified as NOT_SPAM and auto-assigned to project ${projectResult.projectId} (confidence: ${projectResult.confidence})`);
                }
                else {
                    email.spamStatus = email_entity_1.EmailSpamStatus.POSSIBLE_SPAM;
                    email.projectId = null;
                    email.isUnassigned = true;
                    this.logger.log(`Email ${email.id} marked as POSSIBLE_SPAM - no project match or low confidence. Project: ${projectResult.projectId || 'none'}, Confidence: ${projectResult.confidence}`);
                }
            }
            else {
                email.spamStatus = email_entity_1.EmailSpamStatus.POSSIBLE_SPAM;
                email.isUnassigned = true;
                email.projectId = null;
                email.aiSuggestedProjectId = null;
                this.logger.log(`Email ${email.id} marked as POSSIBLE_SPAM for manual review (category: ${spamCategory}, confidence: ${email.spamConfidence})`);
            }
            if (!email.status) {
                email.status = email_entity_1.EmailStatus.OPEN;
            }
            return this.emailsRepository.save(email);
        }
        catch (error) {
            this.logger.error(`Error processing email ${email.id}:`, error);
            email.spamStatus = email_entity_1.EmailSpamStatus.POSSIBLE_SPAM;
            email.spamConfidence = 0;
            email.isUnassigned = true;
            email.projectId = null;
            email.aiSuggestedProjectId = null;
            return this.emailsRepository.save(email);
        }
    }
    async processBatch(emails) {
        const processed = [];
        for (const email of emails) {
            try {
                const processedEmail = await this.processEmail(email);
                processed.push(processedEmail);
            }
            catch (error) {
                this.logger.error(`Error processing email ${email.id} in batch:`, error);
            }
        }
        return processed;
    }
};
exports.EmailProcessorService = EmailProcessorService;
exports.EmailProcessorService = EmailProcessorService = EmailProcessorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(email_entity_1.Email)),
    __param(1, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        spam_classifier_service_1.SpamClassifierService,
        project_classifier_service_1.ProjectClassifierService,
        claude_provider_1.ClaudeProvider])
], EmailProcessorService);
//# sourceMappingURL=email-processor.service.js.map