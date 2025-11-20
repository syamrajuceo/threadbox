import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Email, EmailStatus } from '../emails/entities/email.entity';
import { EmailAssignment } from './entities/email-assignment.entity';
import { UpdateEmailStatusDto } from './dto/update-email-status.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Email)
    private emailsRepository: Repository<Email>,
    @InjectRepository(EmailAssignment)
    private emailAssignmentsRepository: Repository<EmailAssignment>,
    private notificationsService: NotificationsService,
  ) {}

  async assignToUser(
    emailId: string,
    userId: string,
    assignedBy: string,
  ): Promise<Email> {
    const email = await this.emailsRepository.findOne({
      where: { id: emailId },
      relations: ['project'],
    });
    if (!email) {
      throw new Error('Email not found');
    }

    email.assignedToId = userId;
    email.assignedToRoleId = null;
    email.isUnassigned = false;
    const savedEmail = await this.emailsRepository.save(email);

    // Send notification
    await this.notificationsService.notifyAssignment(
      userId,
      emailId,
      email.projectId || '',
      assignedBy,
    );

    return savedEmail;
  }

  async assignToRole(emailId: string, roleId: string): Promise<Email> {
    const email = await this.emailsRepository.findOne({ where: { id: emailId } });
    if (!email) {
      throw new Error('Email not found');
    }

    email.assignedToRoleId = roleId;
    email.assignedToId = null;
    email.isUnassigned = false;
    return this.emailsRepository.save(email);
  }

  async assignToMultipleUsers(
    emailId: string,
    userIds: string[],
    assignedById: string,
  ): Promise<EmailAssignment[]> {
    const email = await this.emailsRepository.findOne({
      where: { id: emailId },
      relations: ['project'],
    });
    if (!email) {
      throw new Error('Email not found');
    }

    // Remove existing assignments for this email
    await this.emailAssignmentsRepository.delete({ emailId });

    // Create new assignments
    const assignments: EmailAssignment[] = [];
    for (const userId of userIds) {
      const assignment = this.emailAssignmentsRepository.create({
        emailId,
        assignedToId: userId,
        assignedById,
      });
      const saved = await this.emailAssignmentsRepository.save(assignment);
      assignments.push(saved);

      // Send notification to each assigned user
      await this.notificationsService.notifyAssignment(
        userId,
        emailId,
        email.projectId || '',
        assignedById,
      );
    }

    // Update email's isUnassigned flag
    email.isUnassigned = false;
    await this.emailsRepository.save(email);

    return assignments;
  }

  async getEmailAssignments(emailId: string): Promise<EmailAssignment[]> {
    return this.emailAssignmentsRepository.find({
      where: { emailId },
      relations: ['assignedTo', 'assignedBy'],
    });
  }

  async removeAssignment(assignmentId: string): Promise<void> {
    await this.emailAssignmentsRepository.delete(assignmentId);
  }

  async updateStatus(
    emailId: string,
    status: EmailStatus,
  ): Promise<Email> {
    const email = await this.emailsRepository.findOne({ where: { id: emailId } });
    if (!email) {
      throw new Error('Email not found');
    }

    email.status = status;
    return this.emailsRepository.save(email);
  }
}

