import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Escalation, EscalationStatus } from './entities/escalation.entity';
import { CreateEscalationDto } from './dto/create-escalation.dto';
import { ReviewEscalationDto } from './dto/review-escalation.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class EscalationsService {
  constructor(
    @InjectRepository(Escalation)
    private escalationsRepository: Repository<Escalation>,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
  ) {}

  async create(
    createEscalationDto: CreateEscalationDto,
    requestedById: string,
  ): Promise<Escalation> {
    const escalation = this.escalationsRepository.create({
      ...createEscalationDto,
      requestedById,
    });
    const savedEscalation = await this.escalationsRepository.save(escalation);

    // Notify all Super Users
    const superUsers = await this.usersService.findAll();
    const requestingUser = await this.usersService.findOne(requestedById);
    const requesterName = `${requestingUser.firstName} ${requestingUser.lastName}`;

    const email = await this.escalationsRepository.manager
      .getRepository('emails')
      .findOne({ where: { id: createEscalationDto.emailId } });

    for (const superUser of superUsers) {
      if (superUser.globalRole === 'super_user') {
        await this.notificationsService.notifyEscalation(
          superUser.id,
          createEscalationDto.emailId,
          String((email as { projectId?: string })?.projectId || ''),
          requesterName,
        );
      }
    }

    return savedEscalation;
  }

  async findAll(filters?: {
    status?: EscalationStatus;
    emailId?: string;
  }): Promise<Escalation[]> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.emailId) where.emailId = filters.emailId;

    return this.escalationsRepository.find({
      where,
      relations: ['email', 'requestedBy', 'reviewedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Escalation> {
    const escalation = await this.escalationsRepository.findOne({
      where: { id },
      relations: ['email', 'requestedBy', 'reviewedBy'],
    });
    if (!escalation) {
      throw new NotFoundException(`Escalation with ID ${id} not found`);
    }
    return escalation;
  }

  async review(
    id: string,
    reviewDto: ReviewEscalationDto,
    reviewedById: string,
  ): Promise<Escalation> {
    const escalation = await this.findOne(id);
    escalation.status = reviewDto.status;
    escalation.reviewNotes = reviewDto.notes || null;
    escalation.reviewedById = reviewedById;
    return this.escalationsRepository.save(escalation);
  }
}

