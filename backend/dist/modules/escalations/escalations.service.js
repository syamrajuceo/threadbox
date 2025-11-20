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
exports.EscalationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const escalation_entity_1 = require("./entities/escalation.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const users_service_1 = require("../users/users.service");
let EscalationsService = class EscalationsService {
    escalationsRepository;
    notificationsService;
    usersService;
    constructor(escalationsRepository, notificationsService, usersService) {
        this.escalationsRepository = escalationsRepository;
        this.notificationsService = notificationsService;
        this.usersService = usersService;
    }
    async create(createEscalationDto, requestedById) {
        const escalation = this.escalationsRepository.create({
            ...createEscalationDto,
            requestedById,
        });
        const savedEscalation = await this.escalationsRepository.save(escalation);
        const superUsers = await this.usersService.findAll();
        const requestingUser = await this.usersService.findOne(requestedById);
        const requesterName = `${requestingUser.firstName} ${requestingUser.lastName}`;
        const email = await this.escalationsRepository.manager
            .getRepository('emails')
            .findOne({ where: { id: createEscalationDto.emailId } });
        for (const superUser of superUsers) {
            if (superUser.globalRole === 'super_user') {
                await this.notificationsService.notifyEscalation(superUser.id, createEscalationDto.emailId, String(email?.projectId || ''), requesterName);
            }
        }
        return savedEscalation;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.status)
            where.status = filters.status;
        if (filters?.emailId)
            where.emailId = filters.emailId;
        return this.escalationsRepository.find({
            where,
            relations: ['email', 'requestedBy', 'reviewedBy'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const escalation = await this.escalationsRepository.findOne({
            where: { id },
            relations: ['email', 'requestedBy', 'reviewedBy'],
        });
        if (!escalation) {
            throw new common_1.NotFoundException(`Escalation with ID ${id} not found`);
        }
        return escalation;
    }
    async review(id, reviewDto, reviewedById) {
        const escalation = await this.findOne(id);
        escalation.status = reviewDto.status;
        escalation.reviewNotes = reviewDto.notes || null;
        escalation.reviewedById = reviewedById;
        return this.escalationsRepository.save(escalation);
    }
};
exports.EscalationsService = EscalationsService;
exports.EscalationsService = EscalationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(escalation_entity_1.Escalation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        users_service_1.UsersService])
], EscalationsService);
//# sourceMappingURL=escalations.service.js.map