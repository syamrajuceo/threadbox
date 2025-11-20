import { User } from '../../users/entities/user.entity';
export declare enum EmailProvider {
    GMAIL = "gmail",
    OUTLOOK = "outlook",
    IMAP = "imap"
}
export declare class EmailAccount {
    id: string;
    name: string;
    provider: EmailProvider;
    account: string;
    credentials: string;
    redirectUri: string;
    isActive: boolean;
    lastIngestedAt: Date | null;
    lastIngestedCount: number | null;
    createdById: string;
    createdBy: User;
    createdAt: Date;
    updatedAt: Date;
}
