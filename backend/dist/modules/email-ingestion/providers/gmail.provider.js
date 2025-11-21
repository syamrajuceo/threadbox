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
var GmailProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmailProvider = void 0;
const common_1 = require("@nestjs/common");
const googleapis_1 = require("googleapis");
let GmailProvider = GmailProvider_1 = class GmailProvider {
    logger = new common_1.Logger(GmailProvider_1.name);
    gmail;
    config;
    REQUESTS_PER_SECOND = 30;
    DELAY_BETWEEN_BATCHES_MS = 500;
    DELAY_BETWEEN_REQUESTS_MS = 35;
    MAX_RETRIES = 3;
    INITIAL_RETRY_DELAY_MS = 2000;
    constructor(config) {
        this.config = config;
    }
    async connect() {
        try {
            const gmailCredentials = this.config.credentials;
            const oauth2Client = new googleapis_1.google.auth.OAuth2(gmailCredentials.clientId, gmailCredentials.clientSecret, gmailCredentials.redirectUri);
            oauth2Client.setCredentials({
                refresh_token: gmailCredentials.refreshToken,
            });
            const { credentials: refreshedCredentials } = await oauth2Client.refreshAccessToken();
            oauth2Client.setCredentials(refreshedCredentials);
            this.gmail = googleapis_1.google.gmail({ version: 'v1', auth: oauth2Client });
        }
        catch (error) {
            const errorWithMessage = error;
            if (errorWithMessage.message?.includes('unauthorized_client') ||
                errorWithMessage.code === 401) {
                throw new Error('OAuth unauthorized_client error. Please verify:\n' +
                    '1. The redirect URI matches exactly what is configured in Google Cloud Console\n' +
                    '2. The redirect URI used to obtain the refresh token matches the one you entered\n' +
                    '3. The client ID and client secret are correct\n' +
                    '4. The Gmail API is enabled in your Google Cloud project\n' +
                    `Current redirect URI: ${String(this.config.credentials.redirectUri)}`);
            }
            const errorWithDetails = error;
            if (errorWithDetails.message?.includes('Quota exceeded') ||
                errorWithDetails.message?.includes('quota') ||
                errorWithDetails.code === 429 ||
                errorWithDetails.response?.status === 429) {
                throw new Error('Gmail API quota exceeded. Please wait a few minutes before trying again.\n' +
                    'The system will automatically retry with delays, but you may need to:\n' +
                    '1. Wait 1-2 minutes before retrying\n' +
                    '2. Reduce the number of emails being fetched by using a "since" date\n' +
                    '3. Request a quota increase in Google Cloud Console if needed');
            }
            throw error;
        }
    }
    async disconnect() {
    }
    async fetchEmails(since) {
        let query = '';
        if (since) {
            const unixTimestamp = Math.floor(since.getTime() / 1000);
            query = `after:${unixTimestamp}`;
            this.logger.log(`📧 Gmail: Filtering emails after Unix timestamp: ${unixTimestamp}`);
            this.logger.log(`   Original date: ${since.toISOString()}`);
            this.logger.log(`   UTC date: ${since.toUTCString()}`);
            this.logger.log(`   Query string: ${query}`);
        }
        else {
            this.logger.warn('⚠️  Gmail: No date filter provided - fetching ALL emails');
        }
        const emailMessages = [];
        let pageToken = undefined;
        const batchSize = 100;
        do {
            const responseData = (await this.retryWithBackoff(() => {
                const requestParams = {
                    userId: 'me',
                    q: query,
                    maxResults: batchSize,
                    ...(pageToken && { pageToken }),
                };
                this.logger.debug(`Gmail API request: q="${query}", maxResults=${batchSize}, pageToken=${pageToken ? 'present' : 'none'}`);
                return this.gmail.users.messages.list(requestParams);
            }, 'list messages'));
            const messages = responseData.data.messages || [];
            pageToken = responseData.data.nextPageToken;
            if (messages.length > 0) {
                this.logger.log(`Fetched ${messages.length} messages (total so far: ${emailMessages.length + messages.length})`);
            }
            if (messages.length === 0) {
                break;
            }
            const sequentialBatchSize = 25;
            for (let i = 0; i < messages.length; i += sequentialBatchSize) {
                const batch = messages.slice(i, i + sequentialBatchSize);
                const batchPromises = batch.map(async (message, index) => {
                    if (index > 0) {
                        await this.delay(this.DELAY_BETWEEN_REQUESTS_MS);
                    }
                    return await this.retryWithBackoff(async () => {
                        const fullMessage = (await this.gmail.users.messages.get({
                            userId: 'me',
                            id: message.id,
                            format: 'full',
                        }));
                        return this.parseGmailMessage(fullMessage.data);
                    }, `fetch message ${message.id}`);
                });
                const batchResults = await Promise.all(batchPromises);
                const validEmails = batchResults.filter((email) => email !== null);
                emailMessages.push(...validEmails);
                this.logger.debug(`Fetched ${emailMessages.length} emails so far...`);
                if (i + sequentialBatchSize < messages.length) {
                    await this.delay(this.DELAY_BETWEEN_BATCHES_MS);
                }
            }
            if (pageToken) {
                this.logger.debug(`Fetched ${emailMessages.length} emails, fetching next page...`);
                await this.delay(this.DELAY_BETWEEN_BATCHES_MS);
            }
        } while (pageToken);
        this.logger.log(`Successfully fetched ${emailMessages.length} emails from Gmail`);
        return emailMessages;
    }
    async retryWithBackoff(fn, operation, retries = this.MAX_RETRIES) {
        let lastError;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                const errorWithDetails = error;
                const isQuotaError = errorWithDetails.message?.includes('Quota exceeded') ||
                    errorWithDetails.message?.includes('quota') ||
                    errorWithDetails.code === 429 ||
                    errorWithDetails.response?.status === 429;
                if (isQuotaError && attempt < retries) {
                    const delay = this.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
                    this.logger.warn(`Quota error for ${operation}, retrying in ${delay}ms (attempt ${attempt + 1}/${retries + 1})`);
                    await this.delay(delay);
                    continue;
                }
                if (!isQuotaError || attempt === retries) {
                    throw error;
                }
            }
        }
        throw lastError;
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    parseGmailMessage(message) {
        try {
            const payload = message.payload;
            const headers = payload.headers || [];
            const getHeader = (name) => {
                const header = headers.find((h) => h.name?.toLowerCase() === name.toLowerCase());
                return header?.value || '';
            };
            const subject = getHeader('subject');
            const from = getHeader('from');
            const to = getHeader('to');
            const cc = getHeader('cc');
            const date = getHeader('date');
            const messageId = getHeader('message-id');
            const inReplyTo = getHeader('in-reply-to');
            const references = getHeader('references');
            const bodyData = { body: '', bodyHtml: '' };
            this.extractBody(payload, bodyData);
            const fromMatch = from.match(/^(.+?)\s*<(.+?)>$|^(.+?)$/);
            const fromName = fromMatch ? fromMatch[1] || fromMatch[3] || '' : '';
            const fromAddress = fromMatch
                ? fromMatch[2] || fromMatch[3] || from
                : from;
            const attachments = [];
            this.extractAttachments(payload, attachments);
            return {
                id: String(message.id || ''),
                subject,
                body: bodyData.body || bodyData.bodyHtml.replace(/<[^>]*>/g, ''),
                bodyHtml: bodyData.bodyHtml || bodyData.body,
                fromAddress,
                fromName,
                toAddresses: to.split(',').map((e) => e.trim()),
                ccAddresses: cc ? cc.split(',').map((e) => e.trim()) : [],
                bccAddresses: [],
                receivedAt: new Date(date ||
                    String(message.internalDate || Date.now())),
                messageId,
                inReplyTo,
                references,
                attachments,
            };
        }
        catch (error) {
            this.logger.error('Error parsing Gmail message:', error);
            return null;
        }
    }
    extractBody(part, bodyData) {
        if (part.body?.data) {
            const content = Buffer.from(String(part.body.data), 'base64').toString();
            if (part.mimeType === 'text/html') {
                bodyData.bodyHtml = content;
            }
            else if (part.mimeType === 'text/plain') {
                bodyData.body = content;
            }
        }
        if (part.parts && Array.isArray(part.parts)) {
            for (const subPart of part.parts) {
                this.extractBody(subPart, bodyData);
            }
        }
    }
    extractAttachments(part, attachments) {
        if (part.filename && part.body?.attachmentId) {
            attachments.push({
                filename: part.filename,
                contentType: part.mimeType || 'application/octet-stream',
                size: part.body.size || 0,
                content: Buffer.alloc(0),
            });
        }
        if (part.parts && Array.isArray(part.parts)) {
            for (const subPart of part.parts) {
                this.extractAttachments(subPart, attachments);
            }
        }
    }
    async downloadAttachment(messageId, attachmentId) {
        const response = (await this.gmail.users.messages.attachments.get({
            userId: 'me',
            messageId,
            id: attachmentId,
        }));
        return Buffer.from(String(response.data.data || ''), 'base64');
    }
};
exports.GmailProvider = GmailProvider;
exports.GmailProvider = GmailProvider = GmailProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], GmailProvider);
//# sourceMappingURL=gmail.provider.js.map