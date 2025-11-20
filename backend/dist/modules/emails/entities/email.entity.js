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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = exports.EmailSpamStatus = exports.EmailStatus = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("../../projects/entities/project.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const attachment_entity_1 = require("./attachment.entity");
const email_thread_entity_1 = require("./email-thread.entity");
var EmailStatus;
(function (EmailStatus) {
    EmailStatus["OPEN"] = "open";
    EmailStatus["IN_PROGRESS"] = "in_progress";
    EmailStatus["WAITING"] = "waiting";
    EmailStatus["CLOSED"] = "closed";
})(EmailStatus || (exports.EmailStatus = EmailStatus = {}));
var EmailSpamStatus;
(function (EmailSpamStatus) {
    EmailSpamStatus["NOT_SPAM"] = "not_spam";
    EmailSpamStatus["SPAM"] = "spam";
    EmailSpamStatus["POSSIBLE_SPAM"] = "possible_spam";
})(EmailSpamStatus || (exports.EmailSpamStatus = EmailSpamStatus = {}));
let Email = class Email {
    id;
    subject;
    body;
    bodyHtml;
    fromAddress;
    fromName;
    toAddresses;
    ccAddresses;
    bccAddresses;
    receivedAt;
    messageId;
    inReplyTo;
    references;
    status;
    spamStatus;
    spamConfidence;
    projectId;
    assignedToId;
    assignedToRoleId;
    aiSuggestedProjectId;
    aiProjectConfidence;
    isUnassigned;
    provider;
    providerEmailId;
    createdAt;
    updatedAt;
    project;
    assignedTo;
    attachments;
    thread;
    threadId;
};
exports.Email = Email;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Email.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Email.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Email.prototype, "body", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Email.prototype, "bodyHtml", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Email.prototype, "fromAddress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Email.prototype, "fromName", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, default: [] }),
    __metadata("design:type", Array)
], Email.prototype, "toAddresses", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, default: [] }),
    __metadata("design:type", Array)
], Email.prototype, "ccAddresses", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, default: [] }),
    __metadata("design:type", Array)
], Email.prototype, "bccAddresses", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Email.prototype, "receivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Email.prototype, "messageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Email.prototype, "inReplyTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Email.prototype, "references", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EmailStatus,
        default: EmailStatus.OPEN,
    }),
    __metadata("design:type", String)
], Email.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EmailSpamStatus,
        default: EmailSpamStatus.POSSIBLE_SPAM,
    }),
    __metadata("design:type", String)
], Email.prototype, "spamStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Email.prototype, "spamConfidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Email.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Email.prototype, "assignedToId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Email.prototype, "assignedToRoleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Email.prototype, "aiSuggestedProjectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Email.prototype, "aiProjectConfidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Email.prototype, "isUnassigned", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Email.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Email.prototype, "providerEmailId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Email.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Email.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'projectId' }),
    __metadata("design:type", project_entity_1.Project)
], Email.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'assignedToId' }),
    __metadata("design:type", user_entity_1.User)
], Email.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => attachment_entity_1.Attachment, (attachment) => attachment.email, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Email.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => email_thread_entity_1.EmailThread, (thread) => thread.emails, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'threadId' }),
    __metadata("design:type", email_thread_entity_1.EmailThread)
], Email.prototype, "thread", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Email.prototype, "threadId", void 0);
exports.Email = Email = __decorate([
    (0, typeorm_1.Entity)('emails')
], Email);
//# sourceMappingURL=email.entity.js.map