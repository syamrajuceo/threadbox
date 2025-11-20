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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var GrokProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrokProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let GrokProvider = GrokProvider_1 = class GrokProvider {
    configService;
    logger = new common_1.Logger(GrokProvider_1.name);
    apiKey;
    apiUrl;
    client;
    spamConfidenceThreshold = 0.7;
    projectConfidenceThreshold = 0.6;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('GROK_API_KEY', '');
        this.apiUrl = this.configService.get('GROK_API_URL', 'https://api.x.ai/v1');
        this.client = axios_1.default.create({
            baseURL: this.apiUrl,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
    }
    async classifySpam(emailContent) {
        try {
            const prompt = this.buildSpamClassificationPrompt(emailContent);
            const response = await this.client.post('/chat/completions', {
                model: 'grok-beta',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an email spam detection system. Analyze emails and determine if they are spam.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.3,
                max_tokens: 200,
            });
            const result = this.parseSpamResponse(response.data);
            return result;
        }
        catch (error) {
            this.logger.error('Error classifying spam with Grok:', error);
            return {
                isSpam: false,
                confidence: 0,
                reason: 'AI service unavailable',
            };
        }
    }
    async classifyProject(emailContent, projectDescriptions) {
        try {
            if (!this.apiKey) {
                this.logger.warn('GROK_API_KEY is not configured. AI classification will not work.');
                return {
                    projectId: null,
                    confidence: 0,
                    reason: 'GROK_API_KEY not configured',
                };
            }
            if (projectDescriptions.length === 0) {
                this.logger.warn('No projects available for classification');
                return {
                    projectId: null,
                    confidence: 0,
                    reason: 'No projects available',
                };
            }
            const prompt = this.buildProjectClassificationPrompt(emailContent, projectDescriptions);
            this.logger.debug(`Calling Grok API for project classification. Projects: ${projectDescriptions.length}`);
            const response = await this.client.post('/chat/completions', {
                model: 'grok-beta',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert email routing system. Analyze emails and determine which project they belong to based on project descriptions, keywords, client names, and email content. Always respond with valid JSON only.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.2,
                max_tokens: 500,
            });
            const result = this.parseProjectResponse(response.data, projectDescriptions);
            this.logger.debug(`Grok classification result: projectId=${result.projectId}, confidence=${result.confidence}`);
            return result;
        }
        catch (error) {
            this.logger.error('Error classifying project with Grok:', error);
            const errorWithResponse = error;
            const errorMessage = errorWithResponse.message || 'Unknown error';
            this.logger.error('Error details:', errorWithResponse.response?.data || errorMessage);
            return {
                projectId: null,
                confidence: 0,
                reason: `AI service error: ${errorMessage}`,
            };
        }
    }
    buildSpamClassificationPrompt(emailContent) {
        const truncatedContent = emailContent.substring(0, 3000);
        return `You are an expert email spam detection system. Analyze the following email carefully and determine if it is spam, possible spam, or legitimate email.

Consider these spam indicators:
- Suspicious sender addresses or domains
- Urgent language asking for personal information or money
- Poor grammar and spelling errors
- Suspicious links or attachments
- Unusual requests or offers that seem too good to be true
- Phishing attempts (asking for passwords, account details)
- Promotional content from unknown senders
- Generic greetings ("Dear Customer" instead of your name)
- Threats or urgency ("Your account will be closed")
- Requests for immediate action

Email content:
${truncatedContent}

Analyze this email and respond ONLY with valid JSON in this exact format (no markdown, no code blocks, just the JSON):
{
  "isSpam": true or false,
  "confidence": a number between 0.0 and 1.0,
  "reason": "a brief explanation of your classification"
}

Classification rules:
- isSpam: true if clearly spam, false if legitimate or uncertain
- confidence: 0.9-1.0 for obvious spam, 0.7-0.89 for likely spam, 0.4-0.69 for possible spam, 0.0-0.39 for legitimate
- reason: explain why you classified it this way

Respond with ONLY the JSON object, nothing else.`;
    }
    buildProjectClassificationPrompt(emailContent, projects) {
        const projectsList = projects
            .map((p) => `Project ID: ${p.id}\nName: ${p.name}\nDescription: ${p.description}\nKeywords: ${p.keywords.join(', ') || 'None'}`)
            .join('\n\n');
        const truncatedContent = emailContent.substring(0, 3000);
        return `You are an expert email routing system. Analyze the following email and determine which project it belongs to based on the project descriptions, keywords, and email content.

Available projects:
${projectsList}

Email content:
${truncatedContent}

Analysis guidelines:
- Match email content (subject, body, sender domain) to project descriptions and keywords
- Consider client names, project names, and domain names mentioned in projects
- Look for keywords from the project's keyword list in the email
- Consider the context and purpose of the email
- If the email clearly matches a project with high confidence (0.7+), assign it
- If there's a moderate match (0.5-0.69), you can still assign but with lower confidence
- Only set projectId to null if there's no clear match (confidence < 0.5)

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, just the JSON):
{
  "projectId": "exact-project-id-from-list-above or null",
  "confidence": a number between 0.0 and 1.0,
  "reason": "a brief explanation of why you assigned it to this project or why it's null"
}

Important: Use the EXACT Project ID from the list above. Do not invent IDs.`;
    }
    parseSpamResponse(data) {
        try {
            let content = data.choices?.[0]?.message?.content || '{}';
            content = String(content).trim();
            if (content.startsWith('```json')) {
                content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            else if (content.startsWith('```')) {
                content = content.replace(/```\n?/g, '');
            }
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch && jsonMatch[0]) {
                content = jsonMatch[0];
            }
            const parsed = JSON.parse(content);
            const isSpam = parsed.isSpam === true || parsed.isSpam === 'true';
            const confidence = Math.max(0, Math.min(1, parseFloat(String(parsed.confidence || 0)) || 0));
            const reason = parsed.reason || 'No reason provided';
            this.logger.debug(`Spam classification: isSpam=${isSpam}, confidence=${confidence}, reason=${String(reason)}`);
            return {
                isSpam,
                confidence,
                reason,
            };
        }
        catch (error) {
            this.logger.error('Error parsing spam classification response:', error);
            this.logger.error('Raw response:', data.choices?.[0]?.message?.content);
            return {
                isSpam: false,
                confidence: 0,
                reason: 'Failed to parse AI response',
            };
        }
    }
    parseProjectResponse(data, projects) {
        try {
            let content = data.choices?.[0]?.message?.content || '{}';
            content = String(content).trim();
            if (content.startsWith('```json')) {
                content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            else if (content.startsWith('```')) {
                content = content.replace(/```\n?/g, '');
            }
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch && jsonMatch[0]) {
                content = jsonMatch[0];
            }
            const parsed = JSON.parse(content);
            const projectId = parsed.projectId || null;
            const confidence = Math.max(0, Math.min(1, parseFloat(String(parsed.confidence || 0)) || 0));
            this.logger.debug(`Project classification: projectId=${String(projectId)}, confidence=${confidence}, reason=${String(parsed.reason || 'No reason')}`);
            if (projectId && !projects.find((p) => p.id === projectId)) {
                this.logger.warn(`Invalid project ID returned by AI: ${String(projectId)}. Available projects: ${projects.map((p) => String(p.id)).join(', ')}`);
                return {
                    projectId: null,
                    confidence: 0,
                    reason: 'Invalid project ID returned by AI',
                };
            }
            return {
                projectId,
                confidence,
                reason: parsed.reason || 'No reason provided',
            };
        }
        catch (error) {
            this.logger.error('Error parsing project classification response:', error);
            this.logger.error('Raw response:', data.choices?.[0]?.message?.content);
            return {
                projectId: null,
                confidence: 0,
                reason: 'Failed to parse AI response',
            };
        }
    }
    async classifyCombined(emailContent, projectDescriptions) {
        try {
            const spamResult = await this.classifySpam(emailContent);
            let spamCategory = 'not_spam';
            if (spamResult.isSpam && spamResult.confidence >= 0.7) {
                spamCategory = 'spam';
            }
            else if (spamResult.isSpam && spamResult.confidence >= 0.4) {
                spamCategory = 'possible_spam';
            }
            let projectResult = {
                projectId: null,
                confidence: 0,
                reason: 'Skipped due to spam classification',
            };
            if (spamCategory === 'not_spam') {
                projectResult = await this.classifyProject(emailContent, projectDescriptions);
            }
            return {
                spamClassification: {
                    category: spamCategory,
                    confidence: spamResult.confidence,
                    reason: spamResult.reason,
                },
                projectClassification: {
                    projectId: projectResult.projectId,
                    confidence: projectResult.confidence,
                    reason: projectResult.reason,
                },
            };
        }
        catch (error) {
            this.logger.error('Error in combined classification with Grok:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                spamClassification: {
                    category: 'not_spam',
                    confidence: 0,
                    reason: `AI service error: ${errorMessage}`,
                },
                projectClassification: {
                    projectId: null,
                    confidence: 0,
                    reason: `AI service error: ${errorMessage}`,
                },
            };
        }
    }
};
exports.GrokProvider = GrokProvider;
exports.GrokProvider = GrokProvider = GrokProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GrokProvider);
//# sourceMappingURL=grok.provider.js.map