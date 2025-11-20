"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const spam_classifier_service_1 = require("./services/spam-classifier.service");
const project_classifier_service_1 = require("./services/project-classifier.service");
const claude_provider_1 = require("./providers/claude.provider");
const ai_controller_1 = require("./ai.controller");
const project_entity_1 = require("../projects/entities/project.entity");
let AIModule = class AIModule {
};
exports.AIModule = AIModule;
exports.AIModule = AIModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([project_entity_1.Project])],
        controllers: [ai_controller_1.AIController],
        providers: [claude_provider_1.ClaudeProvider, spam_classifier_service_1.SpamClassifierService, project_classifier_service_1.ProjectClassifierService],
        exports: [claude_provider_1.ClaudeProvider, spam_classifier_service_1.SpamClassifierService, project_classifier_service_1.ProjectClassifierService],
    })
], AIModule);
//# sourceMappingURL=ai.module.js.map