import { EmailAccountsService } from '../services/email-accounts.service';
import { CreateEmailAccountDto } from '../dto/create-email-account.dto';
import { UpdateEmailAccountDto } from '../dto/update-email-account.dto';
export declare class EmailAccountsController {
    private readonly emailAccountsService;
    private readonly logger;
    constructor(emailAccountsService: EmailAccountsService);
    create(createDto: CreateEmailAccountDto, req: any): Promise<import("../entities/email-account.entity").EmailAccount | {
        error: boolean;
        message: string;
        details: string | undefined;
    }>;
    findAll(req: {
        user: {
            id: string;
        };
    }): Promise<import("../entities/email-account.entity").EmailAccount[]>;
    findOne(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<import("../entities/email-account.entity").EmailAccount>;
    update(id: string, updateDto: UpdateEmailAccountDto, req: any): Promise<import("../entities/email-account.entity").EmailAccount | {
        error: boolean;
        message: string;
        details: string | undefined;
    }>;
    remove(id: string, req: any): Promise<{
        success: boolean;
    }>;
    ingest(id: string, req: {
        user: {
            id: string;
        };
    }, since?: string): Promise<{
        success: boolean;
        ingested: number;
        message: any;
    }>;
}
