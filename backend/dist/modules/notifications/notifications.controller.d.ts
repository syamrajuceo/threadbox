import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: any, unreadOnly?: string): Promise<import("./entities/notification.entity").Notification[]>;
    getUnreadCount(req: any): Promise<number>;
    markAsRead(id: string, req: any): Promise<import("./entities/notification.entity").Notification>;
    markAllAsRead(req: any): Promise<void>;
}
