"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailIngestionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const email_ingestion_service_1 = require("./email-ingestion.service");
const email_ingestion_controller_1 = require("./email-ingestion.controller");
const email_ingestion_scheduler_1 = require("./email-ingestion.scheduler");
const email_processor_service_1 = require("./processors/email-processor.service");
const email_accounts_service_1 = require("./services/email-accounts.service");
const email_accounts_controller_1 = require("./controllers/email-accounts.controller");
const email_entity_1 = require("../emails/entities/email.entity");
const attachment_entity_1 = require("../emails/entities/attachment.entity");
const email_thread_entity_1 = require("../emails/entities/email-thread.entity");
const email_account_entity_1 = require("./entities/email-account.entity");
const project_entity_1 = require("../projects/entities/project.entity");
const emails_module_1 = require("../emails/emails.module");
const ai_module_1 = require("../ai/ai.module");
const users_module_1 = require("../users/users.module");
let EmailIngestionModule = class EmailIngestionModule {
};
exports.EmailIngestionModule = EmailIngestionModule;
exports.EmailIngestionModule = EmailIngestionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([email_entity_1.Email, attachment_entity_1.Attachment, email_thread_entity_1.EmailThread, email_account_entity_1.EmailAccount, project_entity_1.Project]),
            emails_module_1.EmailsModule,
            ai_module_1.AIModule,
            users_module_1.UsersModule,
            schedule_1.ScheduleModule.forRoot(),
        ],
        controllers: [email_ingestion_controller_1.EmailIngestionController, email_accounts_controller_1.EmailAccountsController],
        providers: [
            email_ingestion_service_1.EmailIngestionService,
            email_processor_service_1.EmailProcessorService,
            email_ingestion_scheduler_1.EmailIngestionScheduler,
            email_accounts_service_1.EmailAccountsService,
        ],
        exports: [email_ingestion_service_1.EmailIngestionService, email_processor_service_1.EmailProcessorService, email_accounts_service_1.EmailAccountsService],
    })
], EmailIngestionModule);
//# sourceMappingURL=email-ingestion.module.js.map