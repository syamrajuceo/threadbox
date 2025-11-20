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
exports.CreateEmailAccountDto = void 0;
const class_validator_1 = require("class-validator");
const email_account_entity_1 = require("../entities/email-account.entity");
class CreateEmailAccountDto {
    name;
    provider;
    account;
    credentials;
    redirectUri;
    isActive;
}
exports.CreateEmailAccountDto = CreateEmailAccountDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmailAccountDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(email_account_entity_1.EmailProvider),
    __metadata("design:type", String)
], CreateEmailAccountDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmailAccountDto.prototype, "account", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateEmailAccountDto.prototype, "credentials", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmailAccountDto.prototype, "redirectUri", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateEmailAccountDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-email-account.dto.js.map