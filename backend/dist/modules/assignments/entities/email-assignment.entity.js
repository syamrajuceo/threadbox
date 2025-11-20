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
exports.EmailAssignment = void 0;
const typeorm_1 = require("typeorm");
const email_entity_1 = require("../../emails/entities/email.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let EmailAssignment = class EmailAssignment {
    id;
    emailId;
    assignedToId;
    assignedById;
    assignedAt;
    email;
    assignedTo;
    assignedBy;
};
exports.EmailAssignment = EmailAssignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmailAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], EmailAssignment.prototype, "emailId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], EmailAssignment.prototype, "assignedToId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], EmailAssignment.prototype, "assignedById", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EmailAssignment.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => email_entity_1.Email, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'emailId' }),
    __metadata("design:type", email_entity_1.Email)
], EmailAssignment.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'assignedToId' }),
    __metadata("design:type", user_entity_1.User)
], EmailAssignment.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'assignedById' }),
    __metadata("design:type", user_entity_1.User)
], EmailAssignment.prototype, "assignedBy", void 0);
exports.EmailAssignment = EmailAssignment = __decorate([
    (0, typeorm_1.Entity)('email_assignments')
], EmailAssignment);
//# sourceMappingURL=email-assignment.entity.js.map