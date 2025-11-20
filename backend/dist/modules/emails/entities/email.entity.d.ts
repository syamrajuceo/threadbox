import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { Attachment } from './attachment.entity';
import { EmailThread } from './email-thread.entity';
export declare enum EmailStatus {
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    WAITING = "waiting",
    CLOSED = "closed"
}
export declare enum EmailSpamStatus {
    NOT_SPAM = "not_spam",
    SPAM = "spam",
    POSSIBLE_SPAM = "possible_spam"
}
export declare class Email {
    id: string;
    subject: string;
    body: string;
    bodyHtml: string;
    fromAddress: string;
    fromName: string;
    toAddresses: string[];
    ccAddresses: string[];
    bccAddresses: string[];
    receivedAt: Date;
    messageId: string;
    inReplyTo: string;
    references: string;
    status: EmailStatus;
    spamStatus: EmailSpamStatus;
    spamConfidence: number;
    projectId: string | null;
    assignedToId: string | null;
    assignedToRoleId: string | null;
    aiSuggestedProjectId: string | null;
    aiProjectConfidence: number;
    isUnassigned: boolean;
    provider: string;
    providerEmailId: string;
    createdAt: Date;
    updatedAt: Date;
    project: Project;
    assignedTo: User;
    attachments: Attachment[];
    thread: EmailThread;
    threadId: string | null;
}
