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
exports.AssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const assignments_service_1 = require("./assignments.service");
const assign_email_dto_1 = require("./dto/assign-email.dto");
const assign_email_multiple_dto_1 = require("./dto/assign-email-multiple.dto");
const update_email_status_dto_1 = require("./dto/update-email-status.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AssignmentsController = class AssignmentsController {
    assignmentsService;
    constructor(assignmentsService) {
        this.assignmentsService = assignmentsService;
    }
    assignEmail(id, dto, req) {
        const assignedBy = `${req.user.firstName} ${req.user.lastName}`;
        if (dto.userId) {
            return this.assignmentsService.assignToUser(id, dto.userId, assignedBy);
        }
        else if (dto.roleId) {
            return this.assignmentsService.assignToRole(id, dto.roleId);
        }
        throw new Error('Either userId or roleId must be provided');
    }
    assignEmailToMultiple(id, dto, req) {
        return this.assignmentsService.assignToMultipleUsers(id, dto.userIds, req.user.id);
    }
    getEmailAssignments(id) {
        return this.assignmentsService.getEmailAssignments(id);
    }
    updateStatus(id, dto) {
        return this.assignmentsService.updateStatus(id, dto.status);
    }
};
exports.AssignmentsController = AssignmentsController;
__decorate([
    (0, common_1.Patch)('email/:id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_email_dto_1.AssignEmailDto, Object]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "assignEmail", null);
__decorate([
    (0, common_1.Post)('email/:id/assign-multiple'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_email_multiple_dto_1.AssignEmailMultipleDto, Object]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "assignEmailToMultiple", null);
__decorate([
    (0, common_1.Get)('email/:id/assignments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssignmentsController.prototype, "getEmailAssignments", null);
__decorate([
    (0, common_1.Patch)('email/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_email_status_dto_1.UpdateEmailStatusDto]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "updateStatus", null);
exports.AssignmentsController = AssignmentsController = __decorate([
    (0, common_1.Controller)('assignments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [assignments_service_1.AssignmentsService])
], AssignmentsController);
//# sourceMappingURL=assignments.controller.js.map