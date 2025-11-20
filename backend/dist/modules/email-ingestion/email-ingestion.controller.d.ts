import { EmailIngestionService } from './email-ingestion.service';
import { IngestEmailsDto } from './dto/ingest-emails.dto';
export declare class EmailIngestionController {
    private readonly emailIngestionService;
    private readonly logger;
    constructor(emailIngestionService: EmailIngestionService);
    ingestEmails(ingestDto: IngestEmailsDto): Promise<{
        success: boolean;
        ingested: number;
        message: any;
    }>;
    getStatus(): Promise<{
        status: string;
        message: string;
    }>;
}
