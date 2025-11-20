"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_config_1 = require("./config/database.config");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const projects_module_1 = require("./modules/projects/projects.module");
const roles_module_1 = require("./modules/roles/roles.module");
const memberships_module_1 = require("./modules/memberships/memberships.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const emails_module_1 = require("./modules/emails/emails.module");
const email_ingestion_module_1 = require("./modules/email-ingestion/email-ingestion.module");
const ai_module_1 = require("./modules/ai/ai.module");
const incoming_review_module_1 = require("./modules/incoming-review/incoming-review.module");
const notes_module_1 = require("./modules/notes/notes.module");
const assignments_module_1 = require("./modules/assignments/assignments.module");
const escalations_module_1 = require("./modules/escalations/escalations.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const project_manager_module_1 = require("./modules/project-manager/project-manager.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: database_config_1.getDatabaseConfig,
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            projects_module_1.ProjectsModule,
            roles_module_1.RolesModule,
            memberships_module_1.MembershipsModule,
            dashboard_module_1.DashboardModule,
            emails_module_1.EmailsModule,
            email_ingestion_module_1.EmailIngestionModule,
            ai_module_1.AIModule,
            incoming_review_module_1.IncomingReviewModule,
            notes_module_1.NotesModule,
            assignments_module_1.AssignmentsModule,
            escalations_module_1.EscalationsModule,
            notifications_module_1.NotificationsModule,
            project_manager_module_1.ProjectManagerModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map