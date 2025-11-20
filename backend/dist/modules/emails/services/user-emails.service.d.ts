import { Repository } from 'typeorm';
import { Email } from '../entities/email.entity';
import { EmailAssignment } from '../../assignments/entities/email-assignment.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { GlobalRole } from '../../users/entities/user.entity';
export declare class UserEmailsService {
    private emailsRepository;
    private emailAssignmentsRepository;
    private membershipsRepository;
    constructor(emailsRepository: Repository<Email>, emailAssignmentsRepository: Repository<EmailAssignment>, membershipsRepository: Repository<Membership>);
    getVisibleEmails(userId: string, userGlobalRole: GlobalRole, filters?: {
        projectId?: string;
        status?: string;
        search?: string;
    }): Promise<Email[]>;
}
