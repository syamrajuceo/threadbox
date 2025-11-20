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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingReviewController = void 0;
const common_1 = require("@nestjs/common");
const incoming_review_service_1 = require("./incoming-review.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const email_entity_1 = require("../emails/entities/email.entity");
let IncomingReviewController = class IncomingReviewController {
    incomingReviewService;
    constructor(incomingReviewService) {
        this.incomingReviewService = incomingReviewService;
    }
    getUnassignedEmails(spamStatus, dateFrom, dateTo, search) {
        return this.incomingReviewService.getUnassignedEmails({
            spamStatus,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            search,
        });
    }
    assignToProject(id, projectId) {
        const finalProjectId = projectId === '' || projectId === null || projectId === undefined ? '' : projectId;
        return this.incomingReviewService.assignToProject(id, finalProjectId);
    }
    assignToUser(id, userId) {
        return this.incomingReviewService.assignToUser(id, userId);
    }
    markSpamStatus(id, spamStatus) {
        return this.incomingReviewService.markSpamStatus(id, spamStatus);
    }
    bulkAssignToProject(emailIds, projectId) {
        return this.incomingReviewService.bulkAssignToProject(emailIds, projectId);
    }
    processEmailWithAI(id) {
        return this.incomingReviewService.processEmailWithAI(id);
    }
    processEmailsWithAI(emailIds) {
        return this.incomingReviewService.processEmailsWithAI(emailIds);
    }
    processAllUnprocessedEmails() {
        return this.incomingReviewService.processAllUnprocessedEmails();
    }
};
exports.IncomingReviewController = IncomingReviewController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('spamStatus')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], IncomingReviewController.prototype, "getUnassignedEmails", null);
__decorate([
    (0, common_1.Patch)(':id/assign-project'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IncomingReviewController.prototype, "assignToProject", null);
__decorate([
    (0, common_1.Patch)(':id/assign-user'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], IncomingReviewController.prototype, "assignToUser", null);
__decorate([
    (0, common_1.Patch)(':id/spam-status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('spamStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], IncomingReviewController.prototype, "markSpamStatus", null);
__decorate([
    (0, common_1.Patch)('bulk/assign-project'),
    __param(0, (0, common_1.Body)('emailIds')),
    __param(1, (0, common_1.Body)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", void 0)
], IncomingReviewController.prototype, "bulkAssignToProject", null);
__decorate([
    (0, common_1.Patch)(':id/process-ai'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IncomingReviewController.prototype, "processEmailWithAI", null);
__decorate([
    (0, common_1.Patch)('bulk/process-ai'),
    __param(0, (0, common_1.Body)('emailIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], IncomingReviewController.prototype, "processEmailsWithAI", null);
__decorate([
    (0, common_1.Post)('process-all-unprocessed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IncomingReviewController.prototype, "processAllUnprocessedEmails", null);
exports.IncomingReviewController = IncomingReviewController = __decorate([
    (0, common_1.Controller)('incoming-review'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.GlobalRole.SUPER_USER),
    __metadata("design:paramtypes", [incoming_review_service_1.IncomingReviewService])
], IncomingReviewController);
//# sourceMappingURL=incoming-review.controller.js.map