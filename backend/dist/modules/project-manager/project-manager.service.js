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
exports.ProjectManagerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const email_entity_1 = require("../emails/entities/email.entity");
const membership_entity_1 = require("../memberships/entities/membership.entity");
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../roles/entities/role.entity");
const email_assignment_entity_1 = require("../assignments/entities/email-assignment.entity");
let ProjectManagerService = class ProjectManagerService {
    membershipsRepository;
    emailsRepository;
    usersRepository;
    emailAssignmentsRepository;
    constructor(membershipsRepository, emailsRepository, usersRepository, emailAssignmentsRepository) {
        this.membershipsRepository = membershipsRepository;
        this.emailsRepository = emailsRepository;
        this.usersRepository = usersRepository;
        this.emailAssignmentsRepository = emailAssignmentsRepository;
    }
    async isProjectManager(userId, projectId) {
        const membership = await this.membershipsRepository.findOne({
            where: { userId, projectId },
            relations: ['role'],
        });
        if (!membership) {
            return false;
        }
        return membership.role.type === role_entity_1.ProjectRoleType.PROJECT_MANAGER;
    }
    async getManagedProjects(userId) {
        const memberships = await this.membershipsRepository.find({
            where: { userId },
            relations: ['project', 'role'],
        });
        return memberships
            .filter((m) => m.role.type === role_entity_1.ProjectRoleType.PROJECT_MANAGER)
            .map((m) => m.project)
            .filter((p) => !p.archived);
    }
    async getProjectEmails(userId, projectId) {
        const managedProjects = await this.getManagedProjects(userId);
        const projectIds = managedProjects.map((p) => p.id);
        if (projectIds.length === 0) {
            return [];
        }
        if (projectId) {
            if (!projectIds.includes(projectId)) {
                throw new common_1.ForbiddenException('You are not a project manager for this project');
            }
            return this.emailsRepository
                .createQueryBuilder('email')
                .where('email.projectId = :projectId', { projectId })
                .andWhere('email.projectId IS NOT NULL')
                .leftJoinAndSelect('email.project', 'project')
                .leftJoinAndSelect('email.assignedTo', 'assignedTo')
                .orderBy('email.receivedAt', 'DESC')
                .getMany();
        }
        return this.emailsRepository
            .createQueryBuilder('email')
            .where('email.projectId IN (:...projectIds)', { projectIds })
            .leftJoinAndSelect('email.project', 'project')
            .leftJoinAndSelect('email.assignedTo', 'assignedTo')
            .orderBy('email.receivedAt', 'DESC')
            .getMany();
    }
    async getUnassignedProjectEmails(userId, projectId) {
        const isPM = await this.isProjectManager(userId, projectId);
        if (!isPM) {
            throw new common_1.ForbiddenException('You are not a project manager for this project');
        }
        const allEmails = await this.emailsRepository.find({
            where: { projectId },
            relations: ['project'],
            order: { receivedAt: 'DESC' },
        });
        const emailIds = allEmails.map((e) => e.id);
        const assignments = await this.emailAssignmentsRepository.find({
            where: { emailId: (0, typeorm_2.In)(emailIds) },
        });
        const assignedEmailIds = new Set(assignments.map((a) => a.emailId));
        return allEmails.filter((email) => !assignedEmailIds.has(email.id));
    }
    async getAssignedProjectEmails(userId, projectId) {
        const isPM = await this.isProjectManager(userId, projectId);
        if (!isPM) {
            throw new common_1.ForbiddenException('You are not a project manager for this project');
        }
        const assignments = await this.emailAssignmentsRepository
            .createQueryBuilder('assignment')
            .leftJoinAndSelect('assignment.email', 'email')
            .leftJoinAndSelect('email.project', 'project')
            .leftJoinAndSelect('assignment.assignedTo', 'assignedTo')
            .leftJoinAndSelect('assignment.assignedBy', 'assignedBy')
            .where('email.projectId = :projectId', { projectId })
            .orderBy('email.receivedAt', 'DESC')
            .getMany();
        const emailMap = new Map();
        assignments.forEach((assignment) => {
            if (assignment.email) {
                emailMap.set(assignment.email.id, assignment.email);
            }
        });
        return Array.from(emailMap.values());
    }
    async getProjectUsers(projectId, userId) {
        const isPM = await this.isProjectManager(userId, projectId);
        if (!isPM) {
            throw new common_1.ForbiddenException('You are not a project manager for this project');
        }
        const memberships = await this.membershipsRepository.find({
            where: { projectId },
            relations: ['user'],
        });
        return memberships.map((m) => m.user);
    }
    async getUsersByRole(projectId, roleId, userId) {
        const isPM = await this.isProjectManager(userId, projectId);
        if (!isPM) {
            throw new common_1.ForbiddenException('You are not a project manager for this project');
        }
        const memberships = await this.membershipsRepository.find({
            where: { projectId, roleId },
            relations: ['user'],
        });
        return memberships.map((m) => m.user);
    }
    async getEmailAssignments(emailId, userId) {
        const email = await this.emailsRepository.findOne({
            where: { id: emailId },
            relations: ['project'],
        });
        if (!email || !email.projectId) {
            throw new Error('Email not found or not assigned to a project');
        }
        const isPM = await this.isProjectManager(userId, email.projectId);
        if (!isPM) {
            throw new common_1.ForbiddenException('You are not a project manager for this project');
        }
        const assignments = await this.emailAssignmentsRepository.find({
            where: { emailId },
            relations: ['assignedTo', 'assignedBy'],
        });
        return assignments;
    }
};
exports.ProjectManagerService = ProjectManagerService;
exports.ProjectManagerService = ProjectManagerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(membership_entity_1.Membership)),
    __param(1, (0, typeorm_1.InjectRepository)(email_entity_1.Email)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(email_assignment_entity_1.EmailAssignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProjectManagerService);
//# sourceMappingURL=project-manager.service.js.map