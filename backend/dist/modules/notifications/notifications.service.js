"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
let NotificationsService = class NotificationsService {
    notificationsRepository;
    constructor(notificationsRepository) {
        this.notificationsRepository = notificationsRepository;
    }
    async create(notificationData) {
        const notification = this.notificationsRepository.create(notificationData);
        return this.notificationsRepository.save(notification);
    }
    async findAll(userId, unreadOnly) {
        const where = { userId };
        if (unreadOnly) {
            where.isRead = false;
        }
        return this.notificationsRepository.find({
            where,
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
    async getUnreadCount(userId) {
        return this.notificationsRepository.count({
            where: { userId, isRead: false },
        });
    }
    async markAsRead(id, userId) {
        const notification = await this.notificationsRepository.findOne({
            where: { id, userId },
        });
        if (!notification) {
            throw new Error('Notification not found');
        }
        notification.isRead = true;
        return this.notificationsRepository.save(notification);
    }
    async markAllAsRead(userId) {
        await this.notificationsRepository.update({ userId, isRead: false }, { isRead: true });
    }
    async notifyAssignment(userId, emailId, projectId, assignedBy) {
        return this.create({
            userId,
            type: notification_entity_1.NotificationType.ASSIGNMENT,
            title: 'Email Assigned',
            message: `You have been assigned an email by ${assignedBy}`,
            relatedEmailId: emailId,
            relatedProjectId: projectId,
        });
    }
    async notifyMention(userId, emailId, projectId, mentionedBy) {
        return this.create({
            userId,
            type: notification_entity_1.NotificationType.MENTION,
            title: 'You were mentioned',
            message: `${mentionedBy} mentioned you in a note`,
            relatedEmailId: emailId,
            relatedProjectId: projectId,
        });
    }
    async notifyEscalation(userId, emailId, projectId, escalatedBy) {
        return this.create({
            userId,
            type: notification_entity_1.NotificationType.ESCALATION,
            title: 'Escalation Request',
            message: `${escalatedBy} escalated an email for review`,
            relatedEmailId: emailId,
            relatedProjectId: projectId,
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map