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
exports.MembershipsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const membership_entity_1 = require("./entities/membership.entity");
let MembershipsService = class MembershipsService {
    membershipsRepository;
    constructor(membershipsRepository) {
        this.membershipsRepository = membershipsRepository;
    }
    async create(createMembershipDto) {
        const membership = this.membershipsRepository.create(createMembershipDto);
        return this.membershipsRepository.save(membership);
    }
    async findAll(projectId, userId) {
        const where = {};
        if (projectId)
            where.projectId = projectId;
        if (userId)
            where.userId = userId;
        return this.membershipsRepository.find({
            where,
            relations: ['user', 'project', 'role', 'role.permissions'],
        });
    }
    async findOne(id) {
        const membership = await this.membershipsRepository.findOne({
            where: { id },
            relations: ['user', 'project', 'role', 'role.permissions'],
        });
        if (!membership) {
            throw new common_1.NotFoundException(`Membership with ID ${id} not found`);
        }
        return membership;
    }
    async remove(id) {
        const membership = await this.findOne(id);
        await this.membershipsRepository.remove(membership);
    }
};
exports.MembershipsService = MembershipsService;
exports.MembershipsService = MembershipsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(membership_entity_1.Membership)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MembershipsService);
//# sourceMappingURL=memberships.service.js.map