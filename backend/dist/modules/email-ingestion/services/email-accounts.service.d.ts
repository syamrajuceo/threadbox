import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmailAccount } from '../entities/email-account.entity';
import { CreateEmailAccountDto } from '../dto/create-email-account.dto';
import { UpdateEmailAccountDto } from '../dto/update-email-account.dto';
import { EmailIngestionService } from '../email-ingestion.service';
export declare class EmailAccountsService {
    private emailAccountsRepository;
    private configService;
    private emailIngestionService;
    private readonly logger;
    private readonly encryptionSecret;
    constructor(emailAccountsRepository: Repository<EmailAccount>, configService: ConfigService, emailIngestionService: EmailIngestionService);
    create(createDto: CreateEmailAccountDto, userId: string): Promise<EmailAccount>;
    findAll(userId: string): Promise<EmailAccount[]>;
    findOne(id: string, userId: string): Promise<EmailAccount>;
    update(id: string, updateDto: UpdateEmailAccountDto, userId: string): Promise<EmailAccount>;
    remove(id: string, userId: string): Promise<void>;
    getDecryptedCredentials(id: string, userId: string): Promise<any>;
    ingestFromAccount(accountId: string, userId: string, since?: Date): Promise<number>;
}
