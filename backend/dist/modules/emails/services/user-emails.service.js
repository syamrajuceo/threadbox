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
exports.UserEmailsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const email_entity_1 = require("../entities/email.entity");
const email_assignment_entity_1 = require("../../assignments/entities/email-assignment.entity");
const membership_entity_1 = require("../../memberships/entities/membership.entity");
const role_entity_1 = require("../../roles/entities/role.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let UserEmailsService = class UserEmailsService {
    emailsRepository;
    emailAssignmentsRepository;
    membershipsRepository;
    constructor(emailsRepository, emailAssignmentsRepository, membershipsRepository) {
        this.emailsRepository = emailsRepository;
        this.emailAssignmentsRepository = emailAssignmentsRepository;
        this.membershipsRepository = membershipsRepository;
    }
    async getVisibleEmails(userId, userGlobalRole, filters) {
        if (userGlobalRole === user_entity_1.GlobalRole.SUPER_USER) {
            const query = this.emailsRepository
                .createQueryBuilder('email')
                .leftJoinAndSelect('email.project', 'project')
                .leftJoinAndSelect('email.assignedTo', 'assignedTo')
                .leftJoinAndSelect('email.attachments', 'attachments');
            if (filters?.projectId) {
                query.andWhere('email.projectId = :projectId', {
                    projectId: filters.projectId,
                });
                query.andWhere('email.projectId IS NOT NULL');
            }
            if (filters?.status) {
                query.andWhere('email.status = :status', { status: filters.status });
            }
            if (filters?.search) {
                query.andWhere('(email.subject ILIKE :search OR email.fromAddress ILIKE :search OR email.body ILIKE :search)', { search: `%${filters.search}%` });
            }
            return query.orderBy('email.receivedAt', 'DESC').getMany();
        }
        const memberships = await this.membershipsRepository.find({
            where: { userId },
            relations: ['project', 'role'],
        });
        const pmProjects = memberships
            .filter((m) => m.role.type === role_entity_1.ProjectRoleType.PROJECT_MANAGER)
            .map((m) => m.project.id);
        const allProjectIds = memberships.map((m) => m.project.id);
        if (filters?.projectId) {
            if (!allProjectIds.includes(filters.projectId)) {
                return [];
            }
            const query = this.emailsRepository
                .createQueryBuilder('email')
                .leftJoinAndSelect('email.project', 'project')
                .leftJoinAndSelect('email.assignedTo', 'assignedTo')
                .leftJoinAndSelect('email.attachments', 'attachments')
                .where('email.projectId = :projectId', { projectId: filters.projectId })
                .andWhere('email.projectId IS NOT NULL');
            if (pmProjects.includes(filters.projectId)) {
            }
            else {
                const assignments = await this.emailAssignmentsRepository.find({
                    where: { assignedToId: userId },
                    relations: ['email'],
                });
                const assignedEmailIdsInProject = assignments
                    .filter((a) => a.email.projectId === filters.projectId)
                    .map((a) => a.email.id);
                if (assignedEmailIdsInProject.length > 0) {
                    query.andWhere('email.id IN (:...assignedEmailIds)', {
                        assignedEmailIds: assignedEmailIdsInProject,
                    });
                }
                else {
                    return [];
                }
            }
            if (filters?.status) {
                query.andWhere('email.status = :status', { status: filters.status });
            }
            if (filters?.search) {
                query.andWhere('(email.subject ILIKE :search OR email.fromAddress ILIKE :search OR email.body ILIKE :search)', { search: `%${filters.search}%` });
            }
            return query.orderBy('email.receivedAt', 'DESC').getMany();
        }
        const assignments = await this.emailAssignmentsRepository.find({
            where: { assignedToId: userId },
            relations: ['email', 'email.project', 'email.attachments'],
        });
        const assignedEmailIds = new Set(assignments.map((a) => a.email.id));
        const query = this.emailsRepository
            .createQueryBuilder('email')
            .leftJoinAndSelect('email.project', 'project')
            .leftJoinAndSelect('email.assignedTo', 'assignedTo')
            .leftJoinAndSelect('email.attachments', 'attachments');
        const conditions = [];
        const params = {};
        if (pmProjects.length > 0) {
            conditions.push('email.projectId IN (:...pmProjects)');
            params.pmProjects = pmProjects;
        }
        if (assignedEmailIds.size > 0) {
            conditions.push('email.id IN (:...assignedEmailIds)');
            params.assignedEmailIds = Array.from(assignedEmailIds);
        }
        if (conditions.length === 0) {
            return [];
        }
        query.where(`(${conditions.join(' OR ')})`, params);
        if (filters?.status) {
            query.andWhere('email.status = :status', { status: filters.status });
        }
        if (filters?.search) {
            query.andWhere('(email.subject ILIKE :search OR email.fromAddress ILIKE :search OR email.body ILIKE :search)', { search: `%${filters.search}%` });
        }
        return query.orderBy('email.receivedAt', 'DESC').getMany();
    }
};
exports.UserEmailsService = UserEmailsService;
exports.UserEmailsService = UserEmailsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(email_entity_1.Email)),
    __param(1, (0, typeorm_1.InjectRepository)(email_assignment_entity_1.EmailAssignment)),
    __param(2, (0, typeorm_1.InjectRepository)(membership_entity_1.Membership)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserEmailsService);
//# sourceMappingURL=user-emails.service.js.map