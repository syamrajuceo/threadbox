import { Repository } from 'typeorm';
import { Email, EmailStatus } from './entities/email.entity';
import { EmailThread } from './entities/email-thread.entity';
import { Attachment } from './entities/attachment.entity';
import { EmailAssignment } from '../assignments/entities/email-assignment.entity';
import { Note } from '../notes/entities/note.entity';
export declare class EmailsService {
    private emailsRepository;
    private threadsRepository;
    private attachmentsRepository;
    private emailAssignmentsRepository;
    private notesRepository;
    constructor(emailsRepository: Repository<Email>, threadsRepository: Repository<EmailThread>, attachmentsRepository: Repository<Attachment>, emailAssignmentsRepository: Repository<EmailAssignment>, notesRepository: Repository<Note>);
    create(emailData: Partial<Email>): Promise<Email>;
    findAll(filters?: {
        projectId?: string;
        status?: EmailStatus;
        assignedToId?: string;
        isUnassigned?: boolean;
        search?: string;
        dateFrom?: Date;
        dateTo?: Date;
    }): Promise<Email[]>;
    findOne(id: string): Promise<Email>;
    update(id: string, updateData: Partial<Email>): Promise<Email>;
    findByProviderId(provider: string, providerEmailId: string): Promise<Email | null>;
    bulkUpdate(emailIds: string[], updates: Partial<Email>): Promise<void>;
    deleteAllEmails(): Promise<{
        deletedCount: number;
    }>;
}
