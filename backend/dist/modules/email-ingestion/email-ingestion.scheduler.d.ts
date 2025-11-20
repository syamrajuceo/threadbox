import { ConfigService } from '@nestjs/config';
import { EmailIngestionService } from './email-ingestion.service';
export declare class EmailIngestionScheduler {
    private readonly emailIngestionService;
    private readonly configService;
    private readonly logger;
    constructor(emailIngestionService: EmailIngestionService, configService: ConfigService);
    handleEmailIngestion(): Promise<void>;
    private getEmailAccountsFromConfig;
    private getLastIngestionDate;
}
