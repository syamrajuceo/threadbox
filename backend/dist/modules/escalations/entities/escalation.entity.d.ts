import { Email } from '../../emails/entities/email.entity';
import { User } from '../../users/entities/user.entity';
export declare enum EscalationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class Escalation {
    id: string;
    emailId: string;
    requestedById: string;
    reviewedById: string | null;
    message: string;
    status: EscalationStatus;
    reviewNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
    email: Email;
    requestedBy: User;
    reviewedBy: User;
}
