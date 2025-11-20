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
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const email_entity_1 = require("../emails/entities/email.entity");
const email_assignment_entity_1 = require("./entities/email-assignment.entity");
const notifications_service_1 = require("../notifications/notifications.service");
let AssignmentsService = class AssignmentsService {
    emailsRepository;
    emailAssignmentsRepository;
    notificationsService;
    constructor(emailsRepository, emailAssignmentsRepository, notificationsService) {
        this.emailsRepository = emailsRepository;
        this.emailAssignmentsRepository = emailAssignmentsRepository;
        this.notificationsService = notificationsService;
    }
    async assignToUser(emailId, userId, assignedBy) {
        const email = await this.emailsRepository.findOne({
            where: { id: emailId },
            relations: ['project'],
        });
        if (!email) {
            throw new Error('Email not found');
        }
        email.assignedToId = userId;
        email.assignedToRoleId = null;
        email.isUnassigned = false;
        const savedEmail = await this.emailsRepository.save(email);
        await this.notificationsService.notifyAssignment(userId, emailId, email.projectId || '', assignedBy);
        return savedEmail;
    }
    async assignToRole(emailId, roleId) {
        const email = await this.emailsRepository.findOne({
            where: { id: emailId },
        });
        if (!email) {
            throw new Error('Email not found');
        }
        email.assignedToRoleId = roleId;
        email.assignedToId = null;
        email.isUnassigned = false;
        return this.emailsRepository.save(email);
    }
    async assignToMultipleUsers(emailId, userIds, assignedById) {
        const email = await this.emailsRepository.findOne({
            where: { id: emailId },
            relations: ['project'],
        });
        if (!email) {
            throw new Error('Email not found');
        }
        await this.emailAssignmentsRepository.delete({ emailId });
        const assignments = [];
        for (const userId of userIds) {
            const assignment = this.emailAssignmentsRepository.create({
                emailId,
                assignedToId: userId,
                assignedById,
            });
            const saved = await this.emailAssignmentsRepository.save(assignment);
            assignments.push(saved);
            await this.notificationsService.notifyAssignment(userId, emailId, email.projectId || '', assignedById);
        }
        email.isUnassigned = false;
        await this.emailsRepository.save(email);
        return assignments;
    }
    async getEmailAssignments(emailId) {
        return this.emailAssignmentsRepository.find({
            where: { emailId },
            relations: ['assignedTo', 'assignedBy'],
        });
    }
    async removeAssignment(assignmentId) {
        await this.emailAssignmentsRepository.delete(assignmentId);
    }
    async updateStatus(emailId, status) {
        const email = await this.emailsRepository.findOne({
            where: { id: emailId },
        });
        if (!email) {
            throw new Error('Email not found');
        }
        email.status = status;
        return this.emailsRepository.save(email);
    }
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(email_entity_1.Email)),
    __param(1, (0, typeorm_1.InjectRepository)(email_assignment_entity_1.EmailAssignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map