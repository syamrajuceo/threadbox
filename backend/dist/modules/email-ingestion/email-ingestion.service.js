"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmailIngestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailIngestionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const email_entity_1 = require("../emails/entities/email.entity");
const attachment_entity_1 = require("../emails/entities/attachment.entity");
const email_thread_entity_1 = require("../emails/entities/email-thread.entity");
const gmail_provider_1 = require("./providers/gmail.provider");
const outlook_provider_1 = require("./providers/outlook.provider");
const imap_provider_1 = require("./providers/imap.provider");
let EmailIngestionService = EmailIngestionService_1 = class EmailIngestionService {
    emailsRepository;
    attachmentsRepository;
    threadsRepository;
    configService;
    logger = new common_1.Logger(EmailIngestionService_1.name);
    attachmentsDir;
    constructor(emailsRepository, attachmentsRepository, threadsRepository, configService) {
        this.emailsRepository = emailsRepository;
        this.attachmentsRepository = attachmentsRepository;
        this.threadsRepository = threadsRepository;
        this.configService = configService;
        this.attachmentsDir = path.join(process.cwd(), 'storage', 'attachments');
        if (!fs.existsSync(this.attachmentsDir)) {
            fs.mkdirSync(this.attachmentsDir, { recursive: true });
        }
    }
    createProvider(config) {
        switch (config.provider) {
            case 'gmail':
                return new gmail_provider_1.GmailProvider(config);
            case 'outlook':
                return new outlook_provider_1.OutlookProvider(config);
            case 'imap':
                return new imap_provider_1.ImapProvider(config);
            default:
                throw new Error(`Unsupported email provider: ${config.provider}`);
        }
    }
    async ingestEmails(config, since) {
        this.logger.log(`Starting email ingestion for provider: ${config.provider}, account: ${config.account}`);
        if (since) {
            this.logger.log(`Date filter: Only fetching emails after ${since.toISOString()}`);
        }
        else {
            this.logger.warn('⚠️  No date filter provided - will fetch ALL emails (this may take a long time and use many API calls)');
        }
        const provider = this.createProvider(config);
        let ingestedCount = 0;
        try {
            this.logger.log('Connecting to email provider...');
            await provider.connect();
            this.logger.log('Fetching emails with date filter applied at API level...');
            const messages = await provider.fetchEmails(since);
            this.logger.log(`Fetched ${messages.length} email(s) from provider (already filtered by date)`);
            for (const message of messages) {
                try {
                    const existing = await this.emailsRepository.findOne({
                        where: {
                            provider: config.provider,
                            providerEmailId: message.id,
                        },
                    });
                    if (existing) {
                        continue;
                    }
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
                    if (message.attachments && message.attachments.length > 0) {
                        for (const att of message.attachments) {
                            const filePath = await this.saveAttachment(savedEmail.id, att.filename, att.content);
                            await this.attachmentsRepository.save({
                                email: savedEmail,
                                filename: att.filename,
                                contentType: att.contentType,
                                size: att.size,
                                filePath,
                            });
                        }
                    }
                    savedEmail.isUnassigned = true;
                    savedEmail.status = savedEmail.status || email_entity_1.EmailStatus.OPEN;
                    savedEmail.spamStatus = email_entity_1.EmailSpamStatus.POSSIBLE_SPAM;
                    savedEmail.spamConfidence = 0;
                    await this.emailsRepository.save(savedEmail);
                    ingestedCount++;
                }
                catch (error) {
                    this.logger.error(`Error ingesting email ${message.id}:`, error);
                }
            }
            await provider.disconnect();
        }
        catch (error) {
            this.logger.error('Error during email ingestion:', error);
            throw error;
        }
        return ingestedCount;
    }
    saveAttachment(emailId, filename, content) {
        const emailDir = path.join(this.attachmentsDir, emailId);
        if (!fs.existsSync(emailDir)) {
            fs.mkdirSync(emailDir, { recursive: true });
        }
        const filePath = path.join(emailDir, filename);
        fs.writeFileSync(filePath, content);
        return filePath;
    }
};
exports.EmailIngestionService = EmailIngestionService;
exports.EmailIngestionService = EmailIngestionService = EmailIngestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(email_entity_1.Email)),
    __param(1, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(2, (0, typeorm_1.InjectRepository)(email_thread_entity_1.EmailThread)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], EmailIngestionService);
//# sourceMappingURL=email-ingestion.service.js.map