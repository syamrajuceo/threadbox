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
exports.EmailsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const email_entity_1 = require("./entities/email.entity");
const email_thread_entity_1 = require("./entities/email-thread.entity");
const attachment_entity_1 = require("./entities/attachment.entity");
const email_assignment_entity_1 = require("../assignments/entities/email-assignment.entity");
const note_entity_1 = require("../notes/entities/note.entity");
let EmailsService = class EmailsService {
    emailsRepository;
    threadsRepository;
    attachmentsRepository;
    emailAssignmentsRepository;
    notesRepository;
    constructor(emailsRepository, threadsRepository, attachmentsRepository, emailAssignmentsRepository, notesRepository) {
        this.emailsRepository = emailsRepository;
        this.threadsRepository = threadsRepository;
        this.attachmentsRepository = attachmentsRepository;
        this.emailAssignmentsRepository = emailAssignmentsRepository;
        this.notesRepository = notesRepository;
    }
    async create(emailData) {
        const email = this.emailsRepository.create(emailData);
        return this.emailsRepository.save(email);
    }
    async findAll(filters) {
        const query = this.emailsRepository
            .createQueryBuilder('email')
            .leftJoinAndSelect('email.project', 'project')
            .leftJoinAndSelect('email.assignedTo', 'assignedTo')
            .leftJoinAndSelect('email.attachments', 'attachments')
            .leftJoinAndSelect('email.thread', 'thread');
        if (filters?.projectId) {
            query.andWhere('email.projectId = :projectId', {
                projectId: filters.projectId,
            });
        }
        if (filters?.status) {
            query.andWhere('email.status = :status', { status: filters.status });
        }
        if (filters?.assignedToId) {
            query.andWhere('email.assignedToId = :assignedToId', {
                assignedToId: filters.assignedToId,
            });
        }
        if (filters?.isUnassigned !== undefined) {
            query.andWhere('email.isUnassigned = :isUnassigned', {
                isUnassigned: filters.isUnassigned,
            });
        }
        if (filters?.search) {
            query.andWhere('(email.subject ILIKE :search OR email.fromAddress ILIKE :search OR email.body ILIKE :search)', { search: `%${filters.search}%` });
        }
        if (filters?.dateFrom) {
            query.andWhere('email.receivedAt >= :dateFrom', {
                dateFrom: filters.dateFrom,
            });
        }
        if (filters?.dateTo) {
            query.andWhere('email.receivedAt <= :dateTo', {
                dateTo: filters.dateTo,
            });
        }
        return query.orderBy('email.receivedAt', 'DESC').getMany();
    }
    async findOne(id) {
        const email = await this.emailsRepository.findOne({
            where: { id },
            relations: [
                'project',
                'assignedTo',
                'attachments',
                'thread',
                'thread.emails',
            ],
        });
        if (!email) {
            throw new common_1.NotFoundException(`Email with ID ${id} not found`);
        }
        return email;
    }
    async update(id, updateData) {
        const email = await this.findOne(id);
        if ('projectId' in updateData && updateData.projectId === null) {
            await this.emailsRepository
                .createQueryBuilder()
                .update(email_entity_1.Email)
                .set({ projectId: null })
                .where('id = :id', { id })
                .execute();
            const updated = await this.findOne(id);
            const otherUpdates = { ...updateData };
            delete otherUpdates.projectId;
            if (Object.keys(otherUpdates).length > 0) {
                Object.assign(updated, otherUpdates);
                return this.emailsRepository.save(updated);
            }
            return updated;
        }
        Object.assign(email, updateData);
        const saved = await this.emailsRepository.save(email);
        return saved;
    }
    async findByProviderId(provider, providerEmailId) {
        return this.emailsRepository.findOne({
            where: { provider, providerEmailId },
        });
    }
    async bulkUpdate(emailIds, updates) {
        await this.emailsRepository
            .createQueryBuilder()
            .update(email_entity_1.Email)
            .set(updates)
            .where('id IN (:...ids)', { ids: emailIds })
            .execute();
    }
    async deleteAllEmails() {
        const emailCount = await this.emailsRepository.count();
        await this.notesRepository
            .createQueryBuilder()
            .delete()
            .from(note_entity_1.Note)
            .execute();
        await this.emailAssignmentsRepository
            .createQueryBuilder()
            .delete()
            .from(email_assignment_entity_1.EmailAssignment)
            .execute();
        await this.emailsRepository
            .createQueryBuilder()
            .delete()
            .from(email_entity_1.Email)
            .execute();
        await this.threadsRepository
            .createQueryBuilder()
            .delete()
            .from(email_thread_entity_1.EmailThread)
            .execute();
        return { deletedCount: emailCount };
    }
};
exports.EmailsService = EmailsService;
exports.EmailsService = EmailsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(email_entity_1.Email)),
    __param(1, (0, typeorm_1.InjectRepository)(email_thread_entity_1.EmailThread)),
    __param(2, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(3, (0, typeorm_1.InjectRepository)(email_assignment_entity_1.EmailAssignment)),
    __param(4, (0, typeorm_1.InjectRepository)(note_entity_1.Note)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EmailsService);
//# sourceMappingURL=emails.service.js.map