import { Repository } from 'typeorm';
import { Escalation, EscalationStatus } from './entities/escalation.entity';
import { CreateEscalationDto } from './dto/create-escalation.dto';
import { ReviewEscalationDto } from './dto/review-escalation.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
export declare class EscalationsService {
    private escalationsRepository;
    private notificationsService;
    private usersService;
    constructor(escalationsRepository: Repository<Escalation>, notificationsService: NotificationsService, usersService: UsersService);
    create(createEscalationDto: CreateEscalationDto, requestedById: string): Promise<Escalation>;
    findAll(filters?: {
        status?: EscalationStatus;
        emailId?: string;
    }): Promise<Escalation[]>;
    findOne(id: string): Promise<Escalation>;
    review(id: string, reviewDto: ReviewEscalationDto, reviewedById: string): Promise<Escalation>;
}
