"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingReviewModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const incoming_review_controller_1 = require("./incoming-review.controller");
const incoming_review_service_1 = require("./incoming-review.service");
const email_entity_1 = require("../emails/entities/email.entity");
const emails_module_1 = require("../emails/emails.module");
const email_ingestion_module_1 = require("../email-ingestion/email-ingestion.module");
let IncomingReviewModule = class IncomingReviewModule {
};
exports.IncomingReviewModule = IncomingReviewModule;
exports.IncomingReviewModule = IncomingReviewModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([email_entity_1.Email]),
            emails_module_1.EmailsModule,
            email_ingestion_module_1.EmailIngestionModule,
        ],
        controllers: [incoming_review_controller_1.IncomingReviewController],
        providers: [incoming_review_service_1.IncomingReviewService],
        exports: [incoming_review_service_1.IncomingReviewService],
    })
], IncomingReviewModule);
//# sourceMappingURL=incoming-review.module.js.map