import { Repository } from 'typeorm';
import { Email, EmailStatus } from '../emails/entities/email.entity';
import { EmailAssignment } from './entities/email-assignment.entity';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AssignmentsService {
    private emailsRepository;
    private emailAssignmentsRepository;
    private notificationsService;
    constructor(emailsRepository: Repository<Email>, emailAssignmentsRepository: Repository<EmailAssignment>, notificationsService: NotificationsService);
    assignToUser(emailId: string, userId: string, assignedBy: string): Promise<Email>;
    assignToRole(emailId: string, roleId: string): Promise<Email>;
    assignToMultipleUsers(emailId: string, userIds: string[], assignedById: string): Promise<EmailAssignment[]>;
    getEmailAssignments(emailId: string): Promise<EmailAssignment[]>;
    removeAssignment(assignmentId: string): Promise<void>;
    updateStatus(emailId: string, status: EmailStatus): Promise<Email>;
}
