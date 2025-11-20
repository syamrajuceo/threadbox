import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: {
        user: {
            id: string;
        };
    }, unreadOnly?: string): Promise<import("./entities/notification.entity").Notification[]>;
    getUnreadCount(req: {
        user: {
            id: string;
        };
    }): Promise<number>;
    markAsRead(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<import("./entities/notification.entity").Notification>;
    markAllAsRead(req: {
        user: {
            id: string;
        };
    }): Promise<void>;
}
