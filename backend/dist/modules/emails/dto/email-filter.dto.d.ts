import { EmailStatus } from '../entities/email.entity';
export declare class EmailFilterDto {
    projectId?: string;
    status?: EmailStatus;
    assignedToId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    isUnassigned?: boolean | string;
}
