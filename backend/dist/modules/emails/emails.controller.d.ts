import { EmailsService } from './emails.service';
import { UserEmailsService } from './services/user-emails.service';
import { GlobalRole } from '../users/entities/user.entity';
import { Email } from './entities/email.entity';
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
    findAll(filters: EmailFilterDto, req: {
        user: {
            id: string;
            globalRole: GlobalRole;
        };
    }): Promise<Email[]>;
    findOne(id: string): Promise<Email>;
    bulkUpdate(dto: BulkUpdateDto): Promise<{
        success: boolean;
        updated: number;
    }>;
    resetAllEmails(dto: ResetEmailsDto, req: {
        user: {
            email: string;
        };
    }): Promise<{
        success: boolean;
        message: string;
        deletedCount: number;
    }>;
}
