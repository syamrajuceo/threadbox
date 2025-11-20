import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Email, EmailStatus } from './entities/email.entity';
import { EmailThread } from './entities/email-thread.entity';
import { Attachment } from './entities/attachment.entity';
import { EmailAssignment } from '../assignments/entities/email-assignment.entity';
import { Note } from '../notes/entities/note.entity';

@Injectable()
export class EmailsService {
  constructor(
    @InjectRepository(Email)
    private emailsRepository: Repository<Email>,
    @InjectRepository(EmailThread)
    private threadsRepository: Repository<EmailThread>,
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
    @InjectRepository(EmailAssignment)
    private emailAssignmentsRepository: Repository<EmailAssignment>,
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
  ) {}

  async create(emailData: Partial<Email>): Promise<Email> {
    const email = this.emailsRepository.create(emailData);
    return this.emailsRepository.save(email);
  }

  async findAll(filters?: {
    projectId?: string;
    status?: EmailStatus;
    assignedToId?: string;
    isUnassigned?: boolean;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Email[]> {
    const query = this.emailsRepository
      .createQueryBuilder('email')
      .leftJoinAndSelect('email.project', 'project')
      .leftJoinAndSelect('email.assignedTo', 'assignedTo')
      .leftJoinAndSelect('email.attachments', 'attachments')
      .leftJoinAndSelect('email.thread', 'thread');

    if (filters?.projectId) {
      query.andWhere('email.projectId = :projectId', {
        projectId: filters.projectId,
      });
    }
    if (filters?.status) {
      query.andWhere('email.status = :status', { status: filters.status });
    }
    if (filters?.assignedToId) {
      query.andWhere('email.assignedToId = :assignedToId', {
        assignedToId: filters.assignedToId,
      });
    }
    if (filters?.isUnassigned !== undefined) {
      query.andWhere('email.isUnassigned = :isUnassigned', {
        isUnassigned: filters.isUnassigned,
      });
    }
    if (filters?.search) {
      query.andWhere(
        '(email.subject ILIKE :search OR email.fromAddress ILIKE :search OR email.body ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }
    if (filters?.dateFrom) {
      query.andWhere('email.receivedAt >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }
    if (filters?.dateTo) {
      query.andWhere('email.receivedAt <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    return query.orderBy('email.receivedAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Email> {
    const email = await this.emailsRepository.findOne({
      where: { id },
      relations: ['project', 'assignedTo', 'attachments', 'thread', 'thread.emails'],
    });
    if (!email) {
      throw new NotFoundException(`Email with ID ${id} not found`);
    }
    return email;
  }

  async update(id: string, updateData: Partial<Email>): Promise<Email> {
    const email = await this.findOne(id);
    
    // Explicitly handle null values for projectId using query builder
    if ('projectId' in updateData && updateData.projectId === null) {
      await this.emailsRepository
        .createQueryBuilder()
        .update(Email)
        .set({ projectId: null })
        .where('id = :id', { id })
        .execute();
      
      // Reload the email to return updated version
      const updated = await this.findOne(id);
      // Apply other updates if any
      const otherUpdates = { ...updateData };
      delete otherUpdates.projectId;
      if (Object.keys(otherUpdates).length > 0) {
        Object.assign(updated, otherUpdates);
        return this.emailsRepository.save(updated);
      }
      return updated;
    }
    
    // Normal update for non-null values
    Object.assign(email, updateData);
    const saved = await this.emailsRepository.save(email);
    return saved;
  }

  async findByProviderId(provider: string, providerEmailId: string): Promise<Email | null> {
    return this.emailsRepository.findOne({
      where: { provider, providerEmailId },
    });
  }

  async bulkUpdate(emailIds: string[], updates: Partial<Email>): Promise<void> {
    await this.emailsRepository
      .createQueryBuilder()
      .update(Email)
      .set(updates)
      .where('id IN (:...ids)', { ids: emailIds })
      .execute();
  }

  /**
   * Delete all emails and related data
   * This is a destructive operation - use with caution!
   */
  async deleteAllEmails(): Promise<{ deletedCount: number }> {
    // Count emails before deletion
    const emailCount = await this.emailsRepository.count();

    // Delete in order to respect foreign key constraints:
    // 1. Notes (references emails with CASCADE, but delete explicitly for safety)
    await this.notesRepository
      .createQueryBuilder()
      .delete()
      .from(Note)
      .execute();

    // 2. EmailAssignments (references emails with CASCADE, but delete explicitly for safety)
    await this.emailAssignmentsRepository
      .createQueryBuilder()
      .delete()
      .from(EmailAssignment)
      .execute();

    // 3. Delete all emails - this will cascade delete attachments due to CASCADE
    await this.emailsRepository
      .createQueryBuilder()
      .delete()
      .from(Email)
      .execute();

    // 4. Delete email threads that are now empty
    await this.threadsRepository
      .createQueryBuilder()
      .delete()
      .from(EmailThread)
      .execute();

    return { deletedCount: emailCount };
  }
}

