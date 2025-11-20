import { EmailStatus } from '../entities/email.entity';
export declare class BulkUpdateDto {
    emailIds: string[];
    projectId?: string;
    assignedToId?: string;
    status?: EmailStatus;
}
