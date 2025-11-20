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
var OutlookProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutlookProvider = void 0;
const common_1 = require("@nestjs/common");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
let OutlookProvider = OutlookProvider_1 = class OutlookProvider {
    logger = new common_1.Logger(OutlookProvider_1.name);
    client;
    config;
    constructor(config) {
        this.config = config;
        this.client = microsoft_graph_client_1.Client.init({
            authProvider: (done) => {
                done(null, this.config.credentials.accessToken);
            },
        });
    }
    async connect() {
    }
    async disconnect() {
    }
    async fetchEmails(since) {
        let filter = '';
        if (since) {
            filter = `receivedDateTime ge ${since.toISOString()}`;
            this.logger.log(`Filtering emails after: ${since.toISOString()}`);
        }
        else {
            this.logger.log('No date filter provided - fetching ALL emails');
        }
        const allMessages = [];
        let nextLink = undefined;
        const pageSize = 100;
        do {
            let request;
            if (nextLink) {
                const url = new URL(nextLink);
                request = this.client.api(url.pathname + url.search);
            }
            else {
                request = this.client
                    .api('/me/messages')
                    .top(pageSize)
                    .orderby('receivedDateTime desc');
                if (filter) {
                    request = request.filter(filter);
                }
            }
            const response = await request.get();
            const messages = response.value || [];
            allMessages.push(...messages.map((msg) => this.parseOutlookMessage(msg)));
            nextLink = response['@odata.nextLink'];
            if (nextLink) {
                console.log(`Fetched ${allMessages.length} emails so far, continuing...`);
            }
        } while (nextLink);
        return allMessages;
    }
    parseOutlookMessage(message) {
        const body = message.body;
        const from = message.from;
        const toRecipients = message.toRecipients;
        const ccRecipients = message.ccRecipients;
        const bccRecipients = message.bccRecipients;
        const headers = message.internetMessageHeaders;
        const attachments = message.attachments;
        return {
            id: String(message.id || ''),
            subject: String(message.subject || ''),
            body: body?.content || '',
            bodyHtml: body?.contentType === 'html' ? (body.content || '') : '',
            fromAddress: from?.emailAddress?.address || '',
            fromName: from?.emailAddress?.name || '',
            toAddresses: toRecipients?.map((r) => r.emailAddress?.address || '').filter((addr) => Boolean(addr)) || [],
            ccAddresses: ccRecipients?.map((r) => r.emailAddress?.address || '').filter((addr) => Boolean(addr)) || [],
            bccAddresses: bccRecipients?.map((r) => r.emailAddress?.address || '').filter((addr) => Boolean(addr)) || [],
            receivedAt: new Date(String(message.receivedDateTime || Date.now())),
            messageId: String(message.internetMessageId || ''),
            inReplyTo: headers?.find((h) => h.name === 'In-Reply-To')?.value || '',
            references: headers?.find((h) => h.name === 'References')?.value || '',
            attachments: message.hasAttachments && attachments
                ? attachments.map((att) => ({
                    filename: att.name || 'attachment',
                    contentType: att.contentType || 'application/octet-stream',
                    size: att.size || 0,
                    content: Buffer.from(String(att.contentBytes || ''), 'base64'),
                }))
                : [],
        };
    }
    async downloadAttachment(messageId, attachmentId) {
        const attachment = await this.client
            .api(`/me/messages/${messageId}/attachments/${attachmentId}`)
            .get();
        return Buffer.from(String(attachment.contentBytes || ''), 'base64');
    }
};
exports.OutlookProvider = OutlookProvider;
exports.OutlookProvider = OutlookProvider = OutlookProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], OutlookProvider);
//# sourceMappingURL=outlook.provider.js.map