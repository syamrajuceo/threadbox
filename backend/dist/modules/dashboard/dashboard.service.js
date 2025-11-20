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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("../projects/entities/project.entity");
const membership_entity_1 = require("../memberships/entities/membership.entity");
let DashboardService = class DashboardService {
    membershipsRepository;
    projectsRepository;
    constructor(membershipsRepository, projectsRepository) {
        this.membershipsRepository = membershipsRepository;
        this.projectsRepository = projectsRepository;
    }
    async getUserProjects(userId, isSuperUser) {
        let projects;
        if (isSuperUser) {
            projects = await this.projectsRepository.find({
                where: { archived: false },
                order: { updatedAt: 'DESC' },
            });
        }
        else {
            const memberships = await this.membershipsRepository.find({
                where: { userId },
                relations: ['project', 'role'],
            });
            projects = memberships.map((m) => m.project).filter((p) => !p.archived);
        }
        const memberships = await this.membershipsRepository.find({
            where: { userId },
            relations: ['role'],
        });
        const membershipMap = new Map(memberships.map((m) => [m.projectId, m.role.name]));
        return projects.map((project) => ({
            id: project.id,
            name: project.name,
            clientName: project.clientName,
            description: project.description || '',
            role: membershipMap.get(project.id) ||
                (isSuperUser ? 'Super User' : 'Member'),
            openEmailsCount: 0,
            lastUpdated: project.updatedAt,
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(membership_entity_1.Membership)),
    __param(1, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map