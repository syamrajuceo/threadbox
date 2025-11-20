import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Email } from '../emails/entities/email.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { ProjectRoleType } from '../roles/entities/role.entity';
import { EmailAssignment } from '../assignments/entities/email-assignment.entity';

@Injectable()
export class ProjectManagerService {
  constructor(
    @InjectRepository(Membership)
    private membershipsRepository: Repository<Membership>,
    @InjectRepository(Email)
    private emailsRepository: Repository<Email>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(EmailAssignment)
    private emailAssignmentsRepository: Repository<EmailAssignment>,
  ) {}

  /**
   * Check if user is a project manager for a given project
   */
  async isProjectManager(userId: string, projectId: string): Promise<boolean> {
    const membership = await this.membershipsRepository.findOne({
      where: { userId, projectId },
      relations: ['role'],
    });

    if (!membership) {
      return false;
    }

    return membership.role.type === ProjectRoleType.PROJECT_MANAGER;
  }

  /**
   * Get all projects where user is a project manager
   */
  async getManagedProjects(userId: string): Promise<Project[]> {
    const memberships = await this.membershipsRepository.find({
      where: { userId },
      relations: ['project', 'role'],
    });

    return memberships
      .filter((m) => m.role.type === ProjectRoleType.PROJECT_MANAGER)
      .map((m) => m.project)
      .filter((p) => !p.archived);
  }

  /**
   * Get all emails for projects where user is a project manager
   * PMs see all emails in their projects (both assigned and unassigned)
   */
  async getProjectEmails(userId: string, projectId?: string): Promise<Email[]> {
    const managedProjects = await this.getManagedProjects(userId);
    const projectIds = managedProjects.map((p) => p.id);

    if (projectIds.length === 0) {
      return [];
    }

    // If specific project requested, verify user is PM for it
    if (projectId) {
      if (!projectIds.includes(projectId)) {
        throw new ForbiddenException(
          'You are not a project manager for this project',
        );
      }
      // Only return emails assigned to this project (exclude null projectId)
      return this.emailsRepository
        .createQueryBuilder('email')
        .where('email.projectId = :projectId', { projectId })
        .andWhere('email.projectId IS NOT NULL')
        .leftJoinAndSelect('email.project', 'project')
        .leftJoinAndSelect('email.assignedTo', 'assignedTo')
        .orderBy('email.receivedAt', 'DESC')
        .getMany();
    }

    // Return emails for all managed projects
    return this.emailsRepository
      .createQueryBuilder('email')
      .where('email.projectId IN (:...projectIds)', { projectIds })
      .leftJoinAndSelect('email.project', 'project')
      .leftJoinAndSelect('email.assignedTo', 'assignedTo')
      .orderBy('email.receivedAt', 'DESC')
      .getMany();
  }

  /**
   * Get unassigned emails for a project (emails with no EmailAssignment records)
   * These are emails that need to be assigned to team members
   */
  async getUnassignedProjectEmails(
    userId: string,
    projectId: string,
  ): Promise<Email[]> {
    // Verify user is project manager
    const isPM = await this.isProjectManager(userId, projectId);
    if (!isPM) {
      throw new ForbiddenException(
        'You are not a project manager for this project',
      );
    }

    // Get all emails for the project
    const allEmails = await this.emailsRepository.find({
      where: { projectId },
      relations: ['project'],
      order: { receivedAt: 'DESC' },
    });

    // Get all assignments for these emails
    const emailIds = allEmails.map((e) => e.id);
    const assignments = await this.emailAssignmentsRepository.find({
      where: { emailId: In(emailIds) },
    });

    const assignedEmailIds = new Set(assignments.map((a) => a.emailId));

    // Return emails that have no assignments
    return allEmails.filter((email) => !assignedEmailIds.has(email.id));
  }

  /**
   * Get emails assigned to specific users in a project
   */
  async getAssignedProjectEmails(
    userId: string,
    projectId: string,
  ): Promise<Email[]> {
    // Verify user is project manager
    const isPM = await this.isProjectManager(userId, projectId);
    if (!isPM) {
      throw new ForbiddenException(
        'You are not a project manager for this project',
      );
    }

    // Get all assignments for emails in this project
    const assignments = await this.emailAssignmentsRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.email', 'email')
      .leftJoinAndSelect('email.project', 'project')
      .leftJoinAndSelect('assignment.assignedTo', 'assignedTo')
      .leftJoinAndSelect('assignment.assignedBy', 'assignedBy')
      .where('email.projectId = :projectId', { projectId })
      .orderBy('email.receivedAt', 'DESC')
      .getMany();

    // Get unique emails from assignments
    const emailMap = new Map<string, Email>();
    assignments.forEach((assignment) => {
      if (assignment.email) {
        emailMap.set(assignment.email.id, assignment.email);
      }
    });

    return Array.from(emailMap.values());
  }

  /**
   * Get all users in a project (for assignment dropdown)
   */
  async getProjectUsers(projectId: string, userId: string): Promise<User[]> {
    // Verify user is project manager
    const isPM = await this.isProjectManager(userId, projectId);
    if (!isPM) {
      throw new ForbiddenException(
        'You are not a project manager for this project',
      );
    }

    const memberships = await this.membershipsRepository.find({
      where: { projectId },
      relations: ['user'],
    });

    return memberships.map((m) => m.user);
  }

  /**
   * Get users by role in a project
   */
  async getUsersByRole(
    projectId: string,
    roleId: string,
    userId: string,
  ): Promise<User[]> {
    // Verify user is project manager
    const isPM = await this.isProjectManager(userId, projectId);
    if (!isPM) {
      throw new ForbiddenException(
        'You are not a project manager for this project',
      );
    }

    const memberships = await this.membershipsRepository.find({
      where: { projectId, roleId },
      relations: ['user'],
    });

    return memberships.map((m) => m.user);
  }

  /**
   * Get email assignments for an email
   */
  async getEmailAssignments(
    emailId: string,
    userId: string,
  ): Promise<EmailAssignment[]> {
    const email = await this.emailsRepository.findOne({
      where: { id: emailId },
      relations: ['project'],
    });

    if (!email || !email.projectId) {
      throw new Error('Email not found or not assigned to a project');
    }

    // Verify user is project manager
    const isPM = await this.isProjectManager(userId, email.projectId);
    if (!isPM) {
      throw new ForbiddenException(
        'You are not a project manager for this project',
      );
    }

    const assignments = await this.emailAssignmentsRepository.find({
      where: { emailId },
      relations: ['assignedTo', 'assignedBy'],
    });

    return assignments;
  }
}
