import { Email } from '../../emails/entities/email.entity';
import { User } from '../../users/entities/user.entity';
export declare class EmailAssignment {
    id: string;
    emailId: string;
    assignedToId: string;
    assignedById: string;
    assignedAt: Date;
    email: Email;
    assignedTo: User;
    assignedBy: User;
}
