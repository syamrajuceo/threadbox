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
var EmailsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsController = void 0;
const common_1 = require("@nestjs/common");
const emails_service_1 = require("./emails.service");
const user_emails_service_1 = require("./services/user-emails.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const email_filter_dto_1 = require("./dto/email-filter.dto");
const bulk_update_dto_1 = require("./dto/bulk-update.dto");
const reset_emails_dto_1 = require("./dto/reset-emails.dto");
const auth_service_1 = require("../auth/auth.service");
let EmailsController = EmailsController_1 = class EmailsController {
    emailsService;
    userEmailsService;
    authService;
    logger = new common_1.Logger(EmailsController_1.name);
    constructor(emailsService, userEmailsService, authService) {
        this.emailsService = emailsService;
        this.userEmailsService = userEmailsService;
        this.authService = authService;
    }
    findAll(filters, req) {
        return this.userEmailsService.getVisibleEmails(req.user.id, req.user.globalRole, {
            projectId: filters.projectId,
            status: filters.status,
            search: filters.search,
        });
    }
    findOne(id) {
        return this.emailsService.findOne(id);
    }
    async bulkUpdate(dto) {
        const updates = {};
        if (dto.projectId)
            updates.projectId = dto.projectId;
        if (dto.assignedToId)
            updates.assignedToId = dto.assignedToId;
        if (dto.status)
            updates.status = dto.status;
        if (dto.projectId || dto.assignedToId)
            updates.isUnassigned = false;
        await this.emailsService.bulkUpdate(dto.emailIds, updates);
        return { success: true, updated: dto.emailIds.length };
    }
    async resetAllEmails(dto, req) {
        try {
            const user = await this.authService.validateUser(req.user.email, dto.password);
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid password');
            }
            if (user.globalRole !== user_entity_1.GlobalRole.SUPER_USER) {
                throw new common_1.UnauthorizedException('Only super users can reset emails');
            }
            this.logger.warn(`Admin ${user.email} is resetting all emails. This is a destructive operation.`);
            const result = await this.emailsService.deleteAllEmails();
            this.logger.log(`Successfully deleted ${result.deletedCount} emails by admin ${user.email}`);
            return {
                success: true,
                message: `Successfully deleted ${result.deletedCount} email(s)`,
                deletedCount: result.deletedCount,
            };
        }
        catch (error) {
            this.logger.error('Error resetting emails:', error);
            throw error;
        }
    }
};
exports.EmailsController = EmailsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_filter_dto_1.EmailFilterDto, Object]),
    __metadata("design:returntype", void 0)
], EmailsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmailsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_update_dto_1.BulkUpdateDto]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "bulkUpdate", null);
__decorate([
    (0, common_1.Post)('reset-all'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.GlobalRole.SUPER_USER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_emails_dto_1.ResetEmailsDto, Object]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "resetAllEmails", null);
exports.EmailsController = EmailsController = EmailsController_1 = __decorate([
    (0, common_1.Controller)('emails'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [emails_service_1.EmailsService,
        user_emails_service_1.UserEmailsService,
        auth_service_1.AuthService])
], EmailsController);
//# sourceMappingURL=emails.controller.js.map