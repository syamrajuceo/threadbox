import { EmailsService } from './emails.service';
import { UserEmailsService } from './services/user-emails.service';
import { EmailFilterDto } from './dto/email-filter.dto';
import { BulkUpdateDto } from './dto/bulk-update.dto';
import { ResetEmailsDto } from './dto/reset-emails.dto';
import { AuthService } from '../auth/auth.service';
export declare class EmailsController {
    private readonly emailsService;
    private readonly userEmailsService;
    private readonly authService;
    private readonly logger;
    constructor(emailsService: EmailsService, userEmailsService: UserEmailsService, authService: AuthService);
    findAll(filters: EmailFilterDto, req: any): Promise<import("./entities/email.entity").Email[]>;
    findOne(id: string): Promise<import("./entities/email.entity").Email>;
    bulkUpdate(dto: BulkUpdateDto): Promise<{
        success: boolean;
        updated: number;
    }>;
    resetAllEmails(dto: ResetEmailsDto, req: any): Promise<{
        success: boolean;
        message: string;
        deletedCount: number;
    }>;
}
