import { Injectable, Logger } from '@nestjs/common';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import {
  IEmailProvider,
  EmailMessage,
} from '../interfaces/email-provider.interface';
import type { EmailProviderConfig } from '../interfaces/email-provider.interface';

@Injectable()
export class ImapProvider implements IEmailProvider {
  private readonly logger = new Logger(ImapProvider.name);
  private imap: Imap;
  private config: EmailProviderConfig;

  constructor(config: EmailProviderConfig) {
    this.config = config;
    const port = this.config.credentials.port
      ? parseInt(String(this.config.credentials.port), 10)
      : 993;
    this.imap = new Imap({
      user: this.config.credentials.username,
      password: this.config.credentials.password,
      host: this.config.credentials.host,
      port: isNaN(port) ? 993 : port,
      tls: this.config.credentials.tls !== false,
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => resolve());
      this.imap.once('error', (err: Error) => {
        if (
          err.message?.includes('Invalid credentials') ||
          err.message?.includes('authentication failed')
        ) {
          reject(
            new Error(
              'Invalid IMAP credentials. Please check your username and password.',
            ),
          );
        } else {
          reject(err);
        }
      });
      this.imap.connect();
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.imap.end();
      this.imap.once('close', () => resolve());
    });
  }

  async fetchEmails(since?: Date): Promise<EmailMessage[]> {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err) => {
        if (err) {
          reject(err);
          return;
        }

        if (since) {
          this.logger.log(`Filtering emails after: ${since.toISOString()}`);
        } else {
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

          const emails: EmailMessage[] = [];

          fetch.on('message', (msg, seqno) => {
            let emailData = '';

            msg.on('body', (stream) => {
              stream.on('data', (chunk) => {
                emailData += chunk.toString('utf8');
              });
            });

            msg.once('end', async () => {
              try {
                const parsed = await simpleParser(emailData);
                // Helper function to extract addresses
                const extractAddresses = (addressObj: unknown): string[] => {
                  if (!addressObj) return [];
                  if (Array.isArray(addressObj)) {
                    return addressObj
                      .flatMap(
                        (addr: {
                          value?:
                            | Array<{ address?: string }>
                            | { address?: string };
                        }) =>
                          Array.isArray(addr.value)
                            ? addr.value.map(
                                (a: { address?: string }) => a.address || '',
                              )
                            : addr.value
                              ? [
                                  (addr.value as { address?: string })
                                    .address || '',
                                ]
                              : [],
                      )
                      .filter((addr): addr is string => Boolean(addr));
                  }
                  const addrObj = addressObj as {
                    value?: Array<{ address?: string }> | { address?: string };
                  };
                  if (addrObj.value) {
                    return Array.isArray(addrObj.value)
                      ? addrObj.value
                          .map((a: { address?: string }) => a.address || '')
                          .filter((addr): addr is string => Boolean(addr))
                      : [
                          (addrObj.value as { address?: string }).address || '',
                        ].filter((addr): addr is string => Boolean(addr));
                  }
                  return [];
                };

                const email: EmailMessage = {
                  id: String(seqno),
                  subject: parsed.subject || '',
                  body: parsed.text || '',
                  bodyHtml: parsed.html || '',
                  fromAddress: (() => {
                    const from = parsed.from as
                      | {
                          value?:
                            | Array<{ address?: string }>
                            | { address?: string };
                        }
                      | undefined;
                    if (!from) return '';
                    if (Array.isArray(from.value)) {
                      return from.value[0]?.address || '';
                    }
                    return (from.value as { address?: string })?.address || '';
                  })(),
                  fromName: (() => {
                    const from = parsed.from as
                      | { value?: Array<{ name?: string }> | { name?: string } }
                      | undefined;
                    if (!from) return '';
                    if (Array.isArray(from.value)) {
                      return from.value[0]?.name || '';
                    }
                    return (from.value as { name?: string })?.name || '';
                  })(),
                  toAddresses: extractAddresses(parsed.to),
                  ccAddresses: extractAddresses(parsed.cc),
                  bccAddresses: extractAddresses(parsed.bcc),
                  receivedAt: parsed.date || new Date(),
                  messageId: parsed.messageId || '',
                  inReplyTo: parsed.inReplyTo || '',
                  references:
                    (Array.isArray(parsed.references)
                      ? parsed.references.join(' ')
                      : typeof parsed.references === 'string'
                        ? parsed.references
                        : '') || '',
                  attachments:
                    parsed.attachments?.map((att) => ({
                      filename: att.filename || 'attachment',
                      contentType:
                        att.contentType || 'application/octet-stream',
                      size: att.size || 0,
                      content: att.content,
                    })) || [],
                };
                emails.push(email);
              } catch (parseError) {
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

  async downloadAttachment(
    _messageId: string,
    _attachmentId: string,
  ): Promise<Buffer> {
    // IMAP attachments are included in the message body
    // This would need to be implemented based on specific attachment handling
    throw new Error('Attachment download not yet implemented for IMAP');
  }
}
