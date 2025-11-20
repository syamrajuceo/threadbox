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
var ClaudeProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let ClaudeProvider = ClaudeProvider_1 = class ClaudeProvider {
    configService;
    logger = new common_1.Logger(ClaudeProvider_1.name);
    apiKey;
    apiUrl;
    model;
    client;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('CLAUDE_API_KEY', '');
        this.apiUrl =
            this.configService.get('CLAUDE_API_URL', 'https://api.anthropic.com/v1');
        this.model = this.configService.get('CLAUDE_MODEL', 'claude-3-5-sonnet-20241022');
        this.client = axios_1.default.create({
            baseURL: this.apiUrl,
            headers: {
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
            },
            timeout: 60000,
        });
    }
    async classifySpam(emailContent) {
        try {
            if (!this.apiKey) {
                this.logger.warn('CLAUDE_API_KEY is not configured. AI classification will not work.');
                return {
                    isSpam: false,
                    confidence: 0,
                    reason: 'CLAUDE_API_KEY not configured',
                };
            }
            const prompt = this.buildSpamClassificationPrompt(emailContent);
            const response = await this.client.post('/messages', {
                model: this.model,
                max_tokens: 500,
                temperature: 0.3,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });
            const result = this.parseSpamResponse(response.data);
            return result;
        }
        catch (error) {
            this.logger.error('Error classifying spam with Claude:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorResponse = error?.response?.data;
            this.logger.error('Error details:', errorResponse || errorMessage);
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
                this.logger.warn('CLAUDE_API_KEY is not configured. AI classification will not work.');
                return {
                    projectId: null,
                    confidence: 0,
                    reason: 'CLAUDE_API_KEY not configured',
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
            this.logger.debug(`Calling Claude API for project classification. Projects: ${projectDescriptions.length}`);
            const response = await this.client.post('/messages', {
                model: this.model,
                max_tokens: 1000,
                temperature: 0.2,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });
            const result = this.parseProjectResponse(response.data, projectDescriptions);
            this.logger.debug(`Claude classification result: projectId=${result.projectId}, confidence=${result.confidence}`);
            return result;
        }
        catch (error) {
            this.logger.error('Error classifying project with Claude:', error);
            this.logger.error('Error details:', error.response?.data || error.message);
            return {
                projectId: null,
                confidence: 0,
                reason: `AI service error: ${error.message || 'Unknown error'}`,
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
  "reason": explain why you classified it this way
}

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
            let content = '';
            if (data.content && Array.isArray(data.content)) {
                content = data.content
                    .map((block) => block.text || '')
                    .join('');
            }
            else if (data.content && typeof data.content === 'string') {
                content = data.content;
            }
            else {
                content = JSON.stringify(data);
            }
            content = content.trim();
            if (content.startsWith('```json')) {
                content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            else if (content.startsWith('```')) {
                content = content.replace(/```\n?/g, '');
            }
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                content = jsonMatch[0];
            }
            const parsed = JSON.parse(content);
            const isSpam = parsed.isSpam === true || parsed.isSpam === 'true';
            const confidence = Math.max(0, Math.min(1, parseFloat(String(parsed.confidence || 0)) || 0));
            const reason = parsed.reason || 'No reason provided';
            this.logger.debug(`Spam classification: isSpam=${isSpam}, confidence=${confidence}, reason=${reason}`);
            return {
                isSpam,
                confidence,
                reason,
            };
        }
        catch (error) {
            this.logger.error('Error parsing spam classification response:', error);
            this.logger.error('Raw response:', JSON.stringify(data, null, 2));
            return {
                isSpam: false,
                confidence: 0,
                reason: 'Failed to parse AI response',
            };
        }
    }
    parseProjectResponse(data, projects) {
        try {
            let content = '';
            if (data.content && Array.isArray(data.content)) {
                content = data.content
                    .map((block) => block.text || '')
                    .join('');
            }
            else if (data.content && typeof data.content === 'string') {
                content = data.content;
            }
            else {
                content = JSON.stringify(data);
            }
            content = content.trim();
            if (content.startsWith('```json')) {
                content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            else if (content.startsWith('```')) {
                content = content.replace(/```\n?/g, '');
            }
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                content = jsonMatch[0];
            }
            const parsed = JSON.parse(content);
            const projectId = parsed.projectId || null;
            const confidence = Math.max(0, Math.min(1, parseFloat(String(parsed.confidence || 0)) || 0));
            this.logger.debug(`Project classification: projectId=${projectId}, confidence=${confidence}, reason=${parsed.reason || 'No reason'}`);
            if (projectId && !projects.find((p) => p.id === projectId)) {
                this.logger.warn(`Invalid project ID returned by AI: ${projectId}. Available projects: ${projects.map((p) => p.id).join(', ')}`);
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
            this.logger.error('Raw response:', JSON.stringify(data, null, 2));
            return {
                projectId: null,
                confidence: 0,
                reason: 'Failed to parse AI response',
            };
        }
    }
    async classifyCombined(emailContent, projectDescriptions) {
        try {
            if (!this.apiKey) {
                this.logger.warn('CLAUDE_API_KEY is not configured. AI classification will not work.');
                return {
                    spamClassification: {
                        category: 'not_spam',
                        confidence: 0,
                        reason: 'CLAUDE_API_KEY not configured',
                    },
                    projectClassification: {
                        projectId: null,
                        confidence: 0,
                        reason: 'CLAUDE_API_KEY not configured',
                    },
                };
            }
            if (projectDescriptions.length === 0) {
                this.logger.warn('No projects available for classification');
                return {
                    spamClassification: {
                        category: 'not_spam',
                        confidence: 0,
                        reason: 'No projects available',
                    },
                    projectClassification: {
                        projectId: null,
                        confidence: 0,
                        reason: 'No projects available',
                    },
                };
            }
            const prompt = this.buildCombinedClassificationPrompt(emailContent, projectDescriptions);
            const response = await this.client.post('/messages', {
                model: this.model,
                max_tokens: 300,
                temperature: 0.2,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });
            const result = this.parseCombinedResponse(response.data, projectDescriptions);
            return result;
        }
        catch (error) {
            this.logger.error('Error in combined classification with Claude:', error);
            this.logger.error('Error details:', error.response?.data || error.message);
            return {
                spamClassification: {
                    category: 'not_spam',
                    confidence: 0,
                    reason: `AI service error: ${error.message || 'Unknown error'}`,
                },
                projectClassification: {
                    projectId: null,
                    confidence: 0,
                    reason: `AI service error: ${error.message || 'Unknown error'}`,
                },
            };
        }
    }
    buildCombinedClassificationPrompt(emailContent, projects) {
        const projectsList = projects
            .map((p) => `Project ID: ${p.id}\nName: ${p.name}\nDescription: ${p.description}\nKeywords: ${p.keywords.join(', ') || 'None'}`)
            .join('\n\n');
        const truncatedContent = emailContent.substring(0, 2000);
        return `Analyze this email and classify it in ONE step:

1. SPAM CLASSIFICATION: Determine if it's spam, possible spam, or legitimate
   - "spam": Clear spam (phishing, scams, obvious junk)
   - "possible_spam": Suspicious but uncertain (needs manual review)
   - "not_spam": Legitimate email

2. PROJECT CLASSIFICATION: If not_spam, determine which project it belongs to

Available projects:
${projectsList}

Email content:
${truncatedContent}

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "spamCategory": "spam" | "possible_spam" | "not_spam",
  "spamConfidence": 0.0-1.0,
  "spamReason": "brief explanation",
  "projectId": "exact-project-id-from-list or null",
  "projectConfidence": 0.0-1.0,
  "projectReason": "brief explanation"
}

Rules:
- If spamCategory is "spam" → set projectId to null (skip project classification)
- If spamCategory is "possible_spam" → set projectId to null (needs manual review)
- If spamCategory is "not_spam" → classify project (only if confidence >= 0.5)`;
    }
    parseCombinedResponse(data, projects) {
        try {
            let content = '';
            if (data.content && Array.isArray(data.content)) {
                content = data.content
                    .map((block) => block.text || '')
                    .join('');
            }
            else if (data.content && typeof data.content === 'string') {
                content = data.content;
            }
            content = content.trim();
            if (content.startsWith('```json')) {
                content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            else if (content.startsWith('```')) {
                content = content.replace(/```\n?/g, '');
            }
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                content = jsonMatch[0];
            }
            const parsed = JSON.parse(content);
            const spamCategory = parsed.spamCategory || 'not_spam';
            const spamConfidence = Math.max(0, Math.min(1, parseFloat(String(parsed.spamConfidence || 0)) || 0));
            let projectId = parsed.projectId || null;
            const projectConfidence = Math.max(0, Math.min(1, parseFloat(String(parsed.projectConfidence || 0)) || 0));
            if (projectId && !projects.find((p) => p.id === projectId)) {
                this.logger.warn(`Invalid project ID returned by AI: ${projectId}. Available projects: ${projects.map((p) => p.id).join(', ')}`);
                projectId = null;
            }
            if (spamCategory === 'spam' || spamCategory === 'possible_spam') {
                projectId = null;
            }
            return {
                spamClassification: {
                    category: spamCategory,
                    confidence: spamConfidence,
                    reason: parsed.spamReason || 'No reason provided',
                },
                projectClassification: {
                    projectId,
                    confidence: projectConfidence,
                    reason: parsed.projectReason || 'No reason provided',
                },
            };
        }
        catch (error) {
            this.logger.error('Error parsing combined classification response:', error);
            this.logger.error('Raw response:', JSON.stringify(data, null, 2));
            return {
                spamClassification: {
                    category: 'not_spam',
                    confidence: 0,
                    reason: 'Failed to parse AI response',
                },
                projectClassification: {
                    projectId: null,
                    confidence: 0,
                    reason: 'Failed to parse AI response',
                },
            };
        }
    }
    async testConnection() {
        const startTime = Date.now();
        try {
            if (!this.apiKey) {
                throw new Error('CLAUDE_API_KEY is not configured');
            }
            const response = await this.client.post('/messages', {
                model: this.model,
                max_tokens: 5,
                temperature: 0,
                messages: [
                    {
                        role: 'user',
                        content: 'Say "ok"',
                    },
                ],
            });
            const responseTime = Date.now() - startTime;
            let responseText = '';
            if (response.data.content && Array.isArray(response.data.content)) {
                responseText = response.data.content
                    .map((block) => block.text || '')
                    .join('');
            }
            else if (response.data.content && typeof response.data.content === 'string') {
                responseText = response.data.content;
            }
            this.logger.log(`AI connection test successful. Response: ${responseText}, Time: ${responseTime}ms`);
            return {
                status: 'connected',
                responseTime,
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.logger.error('AI connection test failed:', error);
            const errorWithResponse = error;
            if (errorWithResponse.response?.status === 401) {
                throw new Error('Invalid API key. Please check your CLAUDE_API_KEY.');
            }
            else if (errorWithResponse.response?.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }
            else if (errorWithResponse.code === 'ECONNREFUSED' || errorWithResponse.code === 'ENOTFOUND') {
                throw new Error('Cannot connect to Claude API. Please check your network connection.');
            }
            else {
                throw new Error(errorWithResponse.response?.data?.error?.message ||
                    errorWithResponse.message ||
                    'Failed to connect to Claude API');
            }
        }
    }
};
exports.ClaudeProvider = ClaudeProvider;
exports.ClaudeProvider = ClaudeProvider = ClaudeProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ClaudeProvider);
//# sourceMappingURL=claude.provider.js.map