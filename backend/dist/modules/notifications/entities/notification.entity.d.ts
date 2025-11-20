import { User } from '../../users/entities/user.entity';
export declare enum NotificationType {
    ASSIGNMENT = "assignment",
    MENTION = "mention",
    ESCALATION = "escalation",
    STATUS_CHANGE = "status_change"
}
export declare class Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedEmailId: string;
    relatedProjectId: string;
    isRead: boolean;
    createdAt: Date;
    user: User;
}
