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
exports.ProjectManagerController = void 0;
const common_1 = require("@nestjs/common");
const project_manager_service_1 = require("./project-manager.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ProjectManagerController = class ProjectManagerController {
    projectManagerService;
    constructor(projectManagerService) {
        this.projectManagerService = projectManagerService;
    }
    async getManagedProjects(req) {
        return this.projectManagerService.getManagedProjects(req.user.id);
    }
    async getProjectEmails(req, projectId) {
        return this.projectManagerService.getProjectEmails(req.user.id, projectId);
    }
    async getUnassignedEmails(req, projectId) {
        return this.projectManagerService.getUnassignedProjectEmails(req.user.id, projectId);
    }
    async getAssignedEmails(req, projectId) {
        return this.projectManagerService.getAssignedProjectEmails(req.user.id, projectId);
    }
    async getProjectUsers(req, projectId) {
        return this.projectManagerService.getProjectUsers(projectId, req.user.id);
    }
    async getUsersByRole(req, projectId, roleId) {
        return this.projectManagerService.getUsersByRole(projectId, roleId, req.user.id);
    }
    async getEmailAssignments(req, emailId) {
        return this.projectManagerService.getEmailAssignments(emailId, req.user.id);
    }
    async isProjectManager(req, projectId) {
        const isPM = await this.projectManagerService.isProjectManager(req.user.id, projectId);
        return { isProjectManager: isPM };
    }
};
exports.ProjectManagerController = ProjectManagerController;
__decorate([
    (0, common_1.Get)('projects'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectManagerController.prototype, "getManagedProjects", null);
__decorate([
    (0, common_1.Get)('emails'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProjectManagerController.prototype, "getProjectEmails", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/emails/unassigned'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProjectManagerController.prototype, "getUnassignedEmails", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/emails/assigned'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProjectManagerController.prototype, "getAssignedEmails", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/users'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProjectManagerController.prototype, "getProjectUsers", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/roles/:roleId/users'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ProjectManagerController.prototype, "getUsersByRole", null);
__decorate([
    (0, common_1.Get)('emails/:emailId/assignments'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('emailId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProjectManagerController.prototype, "getEmailAssignments", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/is-manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProjectManagerController.prototype, "isProjectManager", null);
exports.ProjectManagerController = ProjectManagerController = __decorate([
    (0, common_1.Controller)('project-manager'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [project_manager_service_1.ProjectManagerService])
], ProjectManagerController);
//# sourceMappingURL=project-manager.controller.js.map