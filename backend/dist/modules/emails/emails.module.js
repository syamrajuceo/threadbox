"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const emails_controller_1 = require("./emails.controller");
const emails_service_1 = require("./emails.service");
const user_emails_service_1 = require("./services/user-emails.service");
const email_entity_1 = require("./entities/email.entity");
const attachment_entity_1 = require("./entities/attachment.entity");
const email_thread_entity_1 = require("./entities/email-thread.entity");
const email_assignment_entity_1 = require("../assignments/entities/email-assignment.entity");
const note_entity_1 = require("../notes/entities/note.entity");
const membership_entity_1 = require("../memberships/entities/membership.entity");
const users_module_1 = require("../users/users.module");
const auth_module_1 = require("../auth/auth.module");
let EmailsModule = class EmailsModule {
};
exports.EmailsModule = EmailsModule;
exports.EmailsModule = EmailsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                email_entity_1.Email,
                attachment_entity_1.Attachment,
                email_thread_entity_1.EmailThread,
                email_assignment_entity_1.EmailAssignment,
                note_entity_1.Note,
                membership_entity_1.Membership,
            ]),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
        ],
        controllers: [emails_controller_1.EmailsController],
        providers: [emails_service_1.EmailsService, user_emails_service_1.UserEmailsService],
        exports: [emails_service_1.EmailsService, user_emails_service_1.UserEmailsService],
    })
], EmailsModule);
//# sourceMappingURL=emails.module.js.map