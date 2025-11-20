import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Email } from '../emails/entities/email.entity';
import { Attachment } from '../emails/entities/attachment.entity';
import { EmailThread } from '../emails/entities/email-thread.entity';
export declare class EmailIngestionService {
    private emailsRepository;
    private attachmentsRepository;
    private threadsRepository;
    private configService;
    private readonly logger;
    private readonly attachmentsDir;
    constructor(emailsRepository: Repository<Email>, attachmentsRepository: Repository<Attachment>, threadsRepository: Repository<EmailThread>, configService: ConfigService);
    private createProvider;
    ingestEmails(config: any, since?: Date): Promise<number>;
    private saveAttachment;
}
