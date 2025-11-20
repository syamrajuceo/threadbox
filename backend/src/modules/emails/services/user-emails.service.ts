import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Email } from '../entities/email.entity';
import { EmailAssignment } from '../../assignments/entities/email-assignment.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { ProjectRoleType } from '../../roles/entities/role.entity';
import { User, GlobalRole } from '../../users/entities/user.entity';

@Injectable()
export class UserEmailsService {
  constructor(
    @InjectRepository(Email)
    private emailsRepository: Repository<Email>,
    @InjectRepository(EmailAssignment)
    private emailAssignmentsRepository: Repository<EmailAssignment>,
    @InjectRepository(Membership)
    private membershipsRepository: Repository<Membership>,
  ) {}

  /**
   * Get emails visible to a user based on their role
   * - Super User: sees everything
   * - Project Manager: sees all emails in their projects
   * - Regular members: only see emails assigned to them
   */
  async getVisibleEmails(
    userId: string,
    userGlobalRole: GlobalRole,
    filters?: {
      projectId?: string;
      status?: string;
      search?: string;
    },
  ): Promise<Email[]> {
    // Super User sees everything
    if (userGlobalRole === GlobalRole.SUPER_USER) {
      const query = this.emailsRepository
        .createQueryBuilder('email')
        .leftJoinAndSelect('email.project', 'project')
        .leftJoinAndSelect('email.assignedTo', 'assignedTo')
        .leftJoinAndSelect('email.attachments', 'attachments');

      if (filters?.projectId) {
        // Only show emails assigned to this specific project (exclude null projectId)
        query.andWhere('email.projectId = :projectId', {
          projectId: filters.projectId,
        });
        query.andWhere('email.projectId IS NOT NULL');
      }
      if (filters?.status) {
        query.andWhere('email.status = :status', { status: filters.status });
      }
      if (filters?.search) {
        query.andWhere(
          '(email.subject ILIKE :search OR email.fromAddress ILIKE :search OR email.body ILIKE :search)',
          { search: `%${filters.search}%` },
        );
      }

      return query.orderBy('email.receivedAt', 'DESC').getMany();
    }

    // Get user's memberships to determine if they're a PM
    const memberships = await this.membershipsRepository.find({
      where: { userId },
      relations: ['project', 'role'],
    });

    const pmProjects = memberships
      .filter((m) => m.role.type === ProjectRoleType.PROJECT_MANAGER)
      .map((m) => m.project.id);

    const allProjectIds = memberships.map((m) => m.project.id);

    // If filtering by specific projectId, we need to ensure all conditions respect it
    if (filters?.projectId) {
      if (!allProjectIds.includes(filters.projectId)) {
        return []; // User not in this project
      }

      // Build query for emails in this specific project only
      const query = this.emailsRepository
        .createQueryBuilder('email')
        .leftJoinAndSelect('email.project', 'project')
        .leftJoinAndSelect('email.assignedTo', 'assignedTo')
        .leftJoinAndSelect('email.attachments', 'attachments')
        .where('email.projectId = :projectId', { projectId: filters.projectId })
        .andWhere('email.projectId IS NOT NULL');

      // Project Managers see all emails in this project
      if (pmProjects.includes(filters.projectId)) {
        // PM can see all emails in their project - query already filtered by projectId
      } else {
        // Regular member - only see emails assigned to them in this project
        const assignments = await this.emailAssignmentsRepository.find({
          where: { assignedToId: userId },
          relations: ['email'],
        });

        // Filter to only emails in this project that are assigned to the user
        const assignedEmailIdsInProject = assignments
          .filter((a) => a.email.projectId === filters.projectId)
          .map((a) => a.email.id);

        if (assignedEmailIdsInProject.length > 0) {
          query.andWhere('email.id IN (:...assignedEmailIds)', {
            assignedEmailIds: assignedEmailIdsInProject,
          });
        } else {
          // No assignments in this project
          return [];
        }
      }

      if (filters?.status) {
        query.andWhere('email.status = :status', { status: filters.status });
      }

      if (filters?.search) {
        query.andWhere(
          '(email.subject ILIKE :search OR email.fromAddress ILIKE :search OR email.body ILIKE :search)',
          { search: `%${filters.search}%` },
        );
      }

      return query.orderBy('email.receivedAt', 'DESC').getMany();
    }

    // No projectId filter - show all emails user can see
    // Get emails assigned to this user via EmailAssignment
    const assignments = await this.emailAssignmentsRepository.find({
      where: { assignedToId: userId },
      relations: ['email', 'email.project', 'email.attachments'],
    });

    const assignedEmailIds = new Set(assignments.map((a) => a.email.id));

    // Build query for emails user can see
    const query = this.emailsRepository
      .createQueryBuilder('email')
      .leftJoinAndSelect('email.project', 'project')
      .leftJoinAndSelect('email.assignedTo', 'assignedTo')
      .leftJoinAndSelect('email.attachments', 'attachments');

    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    // Project Managers see all emails in their projects
    if (pmProjects.length > 0) {
      conditions.push('email.projectId IN (:...pmProjects)');
      params.pmProjects = pmProjects;
    }

    // Regular members see only emails assigned to them
    if (assignedEmailIds.size > 0) {
      conditions.push('email.id IN (:...assignedEmailIds)');
      params.assignedEmailIds = Array.from(assignedEmailIds);
    }

    if (conditions.length === 0) {
      return []; // User has no access
    }

    query.where(`(${conditions.join(' OR ')})`, params);

    if (filters?.status) {
      query.andWhere('email.status = :status', { status: filters.status });
    }

    if (filters?.search) {
      query.andWhere(
        '(email.subject ILIKE :search OR email.fromAddress ILIKE :search OR email.body ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return query.orderBy('email.receivedAt', 'DESC').getMany();
  }
}

