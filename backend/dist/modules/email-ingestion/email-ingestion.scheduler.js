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
var EmailIngestionScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailIngestionScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const email_ingestion_service_1 = require("./email-ingestion.service");
let EmailIngestionScheduler = EmailIngestionScheduler_1 = class EmailIngestionScheduler {
    emailIngestionService;
    configService;
    logger = new common_1.Logger(EmailIngestionScheduler_1.name);
    constructor(emailIngestionService, configService) {
        this.emailIngestionService = emailIngestionService;
        this.configService = configService;
    }
    async handleEmailIngestion() {
        this.logger.log('Starting scheduled email ingestion...');
        try {
            const emailAccounts = this.getEmailAccountsFromConfig();
            for (const account of emailAccounts) {
                try {
                    const count = await this.emailIngestionService.ingestEmails(account, this.getLastIngestionDate(account.account));
                    this.logger.log(`Ingested ${count} emails from ${account.account} (${account.provider})`);
                }
                catch (error) {
                    this.logger.error(`Failed to ingest emails from ${account.account}:`, error);
                }
            }
        }
        catch (error) {
            this.logger.error('Error in scheduled email ingestion:', error);
        }
    }
    getEmailAccountsFromConfig() {
        const accounts = [];
        const gmailAccounts = this.configService.get('GMAIL_ACCOUNTS');
        if (gmailAccounts) {
            try {
                const parsed = JSON.parse(gmailAccounts);
                accounts.push(...parsed);
            }
            catch (e) {
                this.logger.warn('Failed to parse GMAIL_ACCOUNTS from config');
            }
        }
        return accounts;
    }
    getLastIngestionDate(account) {
        const hoursAgo = 24;
        return new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    }
};
exports.EmailIngestionScheduler = EmailIngestionScheduler;
__decorate([
    (0, schedule_1.Cron)('*/15 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailIngestionScheduler.prototype, "handleEmailIngestion", null);
exports.EmailIngestionScheduler = EmailIngestionScheduler = EmailIngestionScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_ingestion_service_1.EmailIngestionService,
        config_1.ConfigService])
], EmailIngestionScheduler);
//# sourceMappingURL=email-ingestion.scheduler.js.map