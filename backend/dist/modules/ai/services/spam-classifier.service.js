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
var SpamClassifierService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpamClassifierService = void 0;
const common_1 = require("@nestjs/common");
const claude_provider_1 = require("../providers/claude.provider");
let SpamClassifierService = SpamClassifierService_1 = class SpamClassifierService {
    aiProvider;
    logger = new common_1.Logger(SpamClassifierService_1.name);
    spamThreshold = 0.7;
    possibleSpamThreshold = 0.4;
    constructor(aiProvider) {
        this.aiProvider = aiProvider;
    }
    async classify(emailContent) {
        try {
            const cleanContent = emailContent.trim();
            if (!cleanContent || cleanContent.length < 10) {
                this.logger.warn('Email content too short for classification');
                return {
                    isSpam: false,
                    confidence: 0,
                    reason: 'Email content too short',
                };
            }
            const result = await this.aiProvider.classifySpam(cleanContent);
            this.logger.debug(`Spam classification result: isSpam=${result.isSpam}, confidence=${result.confidence}`);
            return result;
        }
        catch (error) {
            this.logger.error('Error in spam classification:', error);
            return {
                isSpam: false,
                confidence: 0,
                reason: 'Classification failed - defaulting to not spam',
            };
        }
    }
    shouldMarkAsSpam(result) {
        return result.isSpam && result.confidence >= this.spamThreshold;
    }
    shouldFlagForReview(result) {
        return ((result.isSpam &&
            result.confidence >= this.possibleSpamThreshold &&
            result.confidence < this.spamThreshold) ||
            (!result.isSpam && result.confidence > 0.3));
    }
};
exports.SpamClassifierService = SpamClassifierService;
exports.SpamClassifierService = SpamClassifierService = SpamClassifierService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [claude_provider_1.ClaudeProvider])
], SpamClassifierService);
//# sourceMappingURL=spam-classifier.service.js.map