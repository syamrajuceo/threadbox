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
var EmailIngestionController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailIngestionController = void 0;
const common_1 = require("@nestjs/common");
const email_ingestion_service_1 = require("./email-ingestion.service");
const ingest_emails_dto_1 = require("./dto/ingest-emails.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let EmailIngestionController = EmailIngestionController_1 = class EmailIngestionController {
    emailIngestionService;
    logger = new common_1.Logger(EmailIngestionController_1.name);
    constructor(emailIngestionService) {
        this.emailIngestionService = emailIngestionService;
    }
    async ingestEmails(ingestDto) {
        try {
            const config = {
                provider: ingestDto.provider,
                account: ingestDto.account,
                credentials: ingestDto.credentials,
            };
            this.logger.log(`Ingesting emails for ${config.provider} account: ${config.account}`);
            const count = await this.emailIngestionService.ingestEmails(config, ingestDto.since);
            return {
                success: true,
                ingested: count,
                message: `Successfully ingested ${count} email(s)`,
            };
        }
        catch (error) {
            this.logger.error('Email ingestion error:', error);
            return {
                success: false,
                ingested: 0,
                message: error.message || 'Failed to ingest emails. Please check your credentials and try again.',
            };
        }
    }
    async getStatus() {
        return {
            status: 'ready',
            message: 'Email ingestion service is ready',
        };
    }
};
exports.EmailIngestionController = EmailIngestionController;
__decorate([
    (0, common_1.Post)('ingest'),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ingest_emails_dto_1.IngestEmailsDto]),
    __metadata("design:returntype", Promise)
], EmailIngestionController.prototype, "ingestEmails", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailIngestionController.prototype, "getStatus", null);
exports.EmailIngestionController = EmailIngestionController = EmailIngestionController_1 = __decorate([
    (0, common_1.Controller)('email-ingestion'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.GlobalRole.SUPER_USER),
    __metadata("design:paramtypes", [email_ingestion_service_1.EmailIngestionService])
], EmailIngestionController);
//# sourceMappingURL=email-ingestion.controller.js.map