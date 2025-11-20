"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectManagerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const project_manager_service_1 = require("./project-manager.service");
const project_manager_controller_1 = require("./project-manager.controller");
const membership_entity_1 = require("../memberships/entities/membership.entity");
const email_entity_1 = require("../emails/entities/email.entity");
const user_entity_1 = require("../users/entities/user.entity");
const email_assignment_entity_1 = require("../assignments/entities/email-assignment.entity");
let ProjectManagerModule = class ProjectManagerModule {
};
exports.ProjectManagerModule = ProjectManagerModule;
exports.ProjectManagerModule = ProjectManagerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                membership_entity_1.Membership,
                email_entity_1.Email,
                user_entity_1.User,
                email_assignment_entity_1.EmailAssignment,
            ]),
        ],
        controllers: [project_manager_controller_1.ProjectManagerController],
        providers: [project_manager_service_1.ProjectManagerService],
        exports: [project_manager_service_1.ProjectManagerService],
    })
], ProjectManagerModule);
//# sourceMappingURL=project-manager.module.js.map