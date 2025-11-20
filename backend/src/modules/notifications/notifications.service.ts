import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(notificationData: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedEmailId?: string;
    relatedProjectId?: string;
  }): Promise<Notification> {
    const notification = this.notificationsRepository.create(notificationData);
    return this.notificationsRepository.save(notification);
  }

  async findAll(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    return this.notificationsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50, // Limit to 50 most recent
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
    });
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async notifyAssignment(
    userId: string,
    emailId: string,
    projectId: string,
    assignedBy: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.ASSIGNMENT,
      title: 'Email Assigned',
      message: `You have been assigned an email by ${assignedBy}`,
      relatedEmailId: emailId,
      relatedProjectId: projectId,
    });
  }

  async notifyMention(
    userId: string,
    emailId: string,
    projectId: string,
    mentionedBy: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.MENTION,
      title: 'You were mentioned',
      message: `${mentionedBy} mentioned you in a note`,
      relatedEmailId: emailId,
      relatedProjectId: projectId,
    });
  }

  async notifyEscalation(
    userId: string,
    emailId: string,
    projectId: string,
    escalatedBy: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.ESCALATION,
      title: 'Escalation Request',
      message: `${escalatedBy} escalated an email for review`,
      relatedEmailId: emailId,
      relatedProjectId: projectId,
    });
  }
}

