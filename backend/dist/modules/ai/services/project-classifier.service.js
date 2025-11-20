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
var ProjectClassifierService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectClassifierService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const claude_provider_1 = require("../providers/claude.provider");
const project_entity_1 = require("../../projects/entities/project.entity");
let ProjectClassifierService = ProjectClassifierService_1 = class ProjectClassifierService {
    aiProvider;
    projectsRepository;
    logger = new common_1.Logger(ProjectClassifierService_1.name);
    confidenceThreshold = 0.5;
    constructor(aiProvider, projectsRepository) {
        this.aiProvider = aiProvider;
        this.projectsRepository = projectsRepository;
    }
    async classify(emailContent, projectIds) {
        try {
            const projects = projectIds
                ? await this.projectsRepository
                    .createQueryBuilder('project')
                    .where('project.id IN (:...ids)', { ids: projectIds })
                    .getMany()
                : await this.projectsRepository.find();
            if (projects.length === 0) {
                return {
                    projectId: null,
                    confidence: 0,
                    reason: 'No projects available',
                };
            }
            const projectDescriptions = projects.map((p) => ({
                id: p.id,
                name: p.name,
                description: p.description || '',
                keywords: p.keywords || [],
            }));
            const result = await this.aiProvider.classifyProject(emailContent, projectDescriptions);
            return result;
        }
        catch (error) {
            this.logger.error('Error in project classification:', error);
            return {
                projectId: null,
                confidence: 0,
                reason: 'Classification failed',
            };
        }
    }
    shouldAutoAssign(result) {
        return (result.projectId !== null &&
            result.confidence >= this.confidenceThreshold);
    }
};
exports.ProjectClassifierService = ProjectClassifierService;
exports.ProjectClassifierService = ProjectClassifierService = ProjectClassifierService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [claude_provider_1.ClaudeProvider,
        typeorm_2.Repository])
], ProjectClassifierService);
//# sourceMappingURL=project-classifier.service.js.map