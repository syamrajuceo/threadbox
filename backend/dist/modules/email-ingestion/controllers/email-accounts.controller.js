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
var EmailAccountsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAccountsController = void 0;
const common_1 = require("@nestjs/common");
const email_accounts_service_1 = require("../services/email-accounts.service");
const create_email_account_dto_1 = require("../dto/create-email-account.dto");
const update_email_account_dto_1 = require("../dto/update-email-account.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
let EmailAccountsController = EmailAccountsController_1 = class EmailAccountsController {
    emailAccountsService;
    logger = new common_1.Logger(EmailAccountsController_1.name);
    constructor(emailAccountsService) {
        this.emailAccountsService = emailAccountsService;
    }
    async create(createDto, req) {
        try {
            this.logger.log(`Creating email account: ${createDto.name} (${createDto.provider})`);
            const account = await this.emailAccountsService.create(createDto, req.user.id);
            this.logger.log(`Email account created successfully: ${account.id}`);
            return account;
        }
        catch (error) {
            this.logger.error('Error creating email account:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create email account';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error('Error message:', errorMessage);
            if (errorStack) {
                this.logger.error('Error stack:', errorStack);
            }
            return {
                error: true,
                message: errorMessage,
                details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
            };
        }
    }
    async findAll(req) {
        return this.emailAccountsService.findAll(req.user.id);
    }
    async findOne(id, req) {
        return this.emailAccountsService.findOne(id, req.user.id);
    }
    async update(id, updateDto, req) {
        try {
            this.logger.log(`Updating email account: ${id}`);
            const account = await this.emailAccountsService.update(id, updateDto, req.user.id);
            this.logger.log(`Email account updated successfully: ${account.id}`);
            return account;
        }
        catch (error) {
            this.logger.error('Error updating email account:', error);
            this.logger.error('Error message:', error.message);
            this.logger.error('Error stack:', error.stack);
            return {
                error: true,
                message: error.message || 'Failed to update email account',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            };
        }
    }
    async remove(id, req) {
        await this.emailAccountsService.remove(id, req.user.id);
        return { success: true };
    }
    async ingest(id, req, since) {
        try {
            this.logger.log(`=== Email Ingestion Request ===`);
            this.logger.log(`Account ID: ${id}`);
            this.logger.log(`Since parameter received: ${since || 'NOT PROVIDED'}`);
            let sinceDate = undefined;
            if (since) {
                sinceDate = new Date(since);
                if (isNaN(sinceDate.getTime())) {
                    this.logger.error(`❌ Invalid date format provided: ${since}. Ignoring date filter.`);
                    sinceDate = undefined;
                }
                else {
                    this.logger.log(`✅ Date filter parsed successfully: ${sinceDate.toISOString()}`);
                    this.logger.log(`   Local time: ${sinceDate.toLocaleString()}`);
                    this.logger.log(`   UTC time: ${sinceDate.toUTCString()}`);
                }
            }
            else {
                this.logger.warn('⚠️  No date filter provided - will fetch ALL emails');
            }
            const count = await this.emailAccountsService.ingestFromAccount(id, req.user.id, sinceDate);
            return {
                success: true,
                ingested: count,
                message: `Successfully ingested ${count} email(s)`,
            };
        }
        catch (error) {
            return {
                success: false,
                ingested: 0,
                message: error.message || 'Failed to ingest emails. Please check your credentials and try again.',
            };
        }
    }
};
exports.EmailAccountsController = EmailAccountsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_email_account_dto_1.CreateEmailAccountDto, Object]),
    __metadata("design:returntype", Promise)
], EmailAccountsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailAccountsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmailAccountsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_email_account_dto_1.UpdateEmailAccountDto, Object]),
    __metadata("design:returntype", Promise)
], EmailAccountsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmailAccountsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/ingest'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('since')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], EmailAccountsController.prototype, "ingest", null);
exports.EmailAccountsController = EmailAccountsController = EmailAccountsController_1 = __decorate([
    (0, common_1.Controller)('email-accounts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.GlobalRole.SUPER_USER),
    __metadata("design:paramtypes", [email_accounts_service_1.EmailAccountsService])
], EmailAccountsController);
//# sourceMappingURL=email-accounts.controller.js.map