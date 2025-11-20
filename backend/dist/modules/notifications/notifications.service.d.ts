import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
export declare class NotificationsService {
    private notificationsRepository;
    constructor(notificationsRepository: Repository<Notification>);
    create(notificationData: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        relatedEmailId?: string;
        relatedProjectId?: string;
    }): Promise<Notification>;
    findAll(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(id: string, userId: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<void>;
    notifyAssignment(userId: string, emailId: string, projectId: string, assignedBy: string): Promise<Notification>;
    notifyMention(userId: string, emailId: string, projectId: string, mentionedBy: string): Promise<Notification>;
    notifyEscalation(userId: string, emailId: string, projectId: string, escalatedBy: string): Promise<Notification>;
}
