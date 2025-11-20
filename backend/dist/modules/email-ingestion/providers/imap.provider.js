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
var ImapProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImapProvider = void 0;
const common_1 = require("@nestjs/common");
const imap_1 = __importDefault(require("imap"));
const mailparser_1 = require("mailparser");
let ImapProvider = ImapProvider_1 = class ImapProvider {
    logger = new common_1.Logger(ImapProvider_1.name);
    imap;
    config;
    constructor(config) {
        this.config = config;
        const port = this.config.credentials.port
            ? parseInt(String(this.config.credentials.port), 10)
            : 993;
        this.imap = new imap_1.default({
            user: this.config.credentials.username,
            password: this.config.credentials.password,
            host: this.config.credentials.host,
            port: isNaN(port) ? 993 : port,
            tls: this.config.credentials.tls !== false,
        });
    }
    async connect() {
        return new Promise((resolve, reject) => {
            this.imap.once('ready', () => resolve());
            this.imap.once('error', (err) => {
                if (err.message?.includes('Invalid credentials') ||
                    err.message?.includes('authentication failed')) {
                    reject(new Error('Invalid IMAP credentials. Please check your username and password.'));
                }
                else {
                    reject(err);
                }
            });
            this.imap.connect();
        });
    }
    async disconnect() {
        return new Promise((resolve) => {
            this.imap.end();
            this.imap.once('close', () => resolve());
        });
    }
    async fetchEmails(since) {
        return new Promise((resolve, reject) => {
            this.imap.openBox('INBOX', false, (err, box) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (since) {
                    this.logger.log(`Filtering emails after: ${since.toISOString()}`);
                }
                else {
                    this.logger.log('No date filter provided - fetching ALL emails');
                }
                const searchCriteria = since ? [['SINCE', since]] : [['ALL']];
                this.imap.search(searchCriteria, (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!results || results.length === 0) {
                        resolve([]);
                        return;
                    }
                    const fetch = this.imap.fetch(results, {
                        bodies: '',
                        struct: true,
                    });
                    const emails = [];
                    fetch.on('message', (msg, seqno) => {
                        let emailData = '';
                        msg.on('body', (stream) => {
                            stream.on('data', (chunk) => {
                                emailData += chunk.toString('utf8');
                            });
                        });
                        msg.once('end', async () => {
                            try {
                                const parsed = await (0, mailparser_1.simpleParser)(emailData);
                                const extractAddresses = (addressObj) => {
                                    if (!addressObj)
                                        return [];
                                    if (Array.isArray(addressObj)) {
                                        return addressObj.flatMap((addr) => Array.isArray(addr.value)
                                            ? addr.value.map((a) => a.address)
                                            : addr.value
                                                ? [addr.value.address]
                                                : []);
                                    }
                                    if (addressObj.value) {
                                        return Array.isArray(addressObj.value)
                                            ? addressObj.value.map((a) => a.address)
                                            : [addressObj.value.address];
                                    }
                                    return [];
                                };
                                const email = {
                                    id: seqno.toString(),
                                    subject: parsed.subject || '',
                                    body: parsed.text || '',
                                    bodyHtml: parsed.html || '',
                                    fromAddress: (() => {
                                        const from = parsed.from;
                                        if (!from)
                                            return '';
                                        if (Array.isArray(from.value)) {
                                            return from.value[0]?.address || '';
                                        }
                                        return from.value?.address || '';
                                    })(),
                                    fromName: (() => {
                                        const from = parsed.from;
                                        if (!from)
                                            return '';
                                        if (Array.isArray(from.value)) {
                                            return from.value[0]?.name || '';
                                        }
                                        return from.value?.name || '';
                                    })(),
                                    toAddresses: extractAddresses(parsed.to),
                                    ccAddresses: extractAddresses(parsed.cc),
                                    bccAddresses: extractAddresses(parsed.bcc),
                                    receivedAt: parsed.date || new Date(),
                                    messageId: parsed.messageId || '',
                                    inReplyTo: parsed.inReplyTo || '',
                                    references: (Array.isArray(parsed.references)
                                        ? parsed.references.join(' ')
                                        : typeof parsed.references === 'string'
                                            ? parsed.references
                                            : '') || '',
                                    attachments: parsed.attachments?.map((att) => ({
                                        filename: att.filename || 'attachment',
                                        contentType: att.contentType || 'application/octet-stream',
                                        size: att.size || 0,
                                        content: att.content,
                                    })) || [],
                                };
                                emails.push(email);
                            }
                            catch (parseError) {
                                console.error('Error parsing email:', parseError);
                            }
                        });
                    });
                    fetch.once('error', reject);
                    fetch.once('end', () => {
                        resolve(emails);
                    });
                });
            });
        });
    }
    async downloadAttachment(messageId, attachmentId) {
        throw new Error('Attachment download not yet implemented for IMAP');
    }
};
exports.ImapProvider = ImapProvider;
exports.ImapProvider = ImapProvider = ImapProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], ImapProvider);
//# sourceMappingURL=imap.provider.js.map