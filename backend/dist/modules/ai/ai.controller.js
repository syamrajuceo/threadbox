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
var AIController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const claude_provider_1 = require("./providers/claude.provider");
const common_2 = require("@nestjs/common");
let AIController = AIController_1 = class AIController {
    claudeProvider;
    logger = new common_2.Logger(AIController_1.name);
    constructor(claudeProvider) {
        this.claudeProvider = claudeProvider;
    }
    async testConnection() {
        try {
            const testResult = await this.claudeProvider.testConnection();
            return {
                success: true,
                connected: true,
                message: 'AI connection is working',
                details: testResult,
            };
        }
        catch (error) {
            this.logger.error('AI connection test failed:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to connect to AI service';
            const errorStack = error instanceof Error ? error.stack : undefined;
            return {
                success: false,
                connected: false,
                message: errorMessage,
                error: process.env.NODE_ENV === 'development' ? errorStack : undefined,
            };
        }
    }
};
exports.AIController = AIController;
__decorate([
    (0, common_1.Get)('test-connection'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIController.prototype, "testConnection", null);
exports.AIController = AIController = AIController_1 = __decorate([
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.GlobalRole.SUPER_USER),
    __metadata("design:paramtypes", [claude_provider_1.ClaudeProvider])
], AIController);
//# sourceMappingURL=ai.controller.js.map