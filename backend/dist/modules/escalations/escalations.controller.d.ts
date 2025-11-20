import { EscalationsService } from './escalations.service';
import { CreateEscalationDto } from './dto/create-escalation.dto';
import { ReviewEscalationDto } from './dto/review-escalation.dto';
import { EscalationStatus } from './entities/escalation.entity';
export declare class EscalationsController {
    private readonly escalationsService;
    constructor(escalationsService: EscalationsService);
    create(createEscalationDto: CreateEscalationDto, req: {
        user: {
            id: string;
        };
    }): Promise<import("./entities/escalation.entity").Escalation>;
    findAll(status?: EscalationStatus, emailId?: string): Promise<import("./entities/escalation.entity").Escalation[]>;
    findOne(id: string): Promise<import("./entities/escalation.entity").Escalation>;
    review(id: string, reviewDto: ReviewEscalationDto, req: {
        user: {
            id: string;
        };
    }): Promise<import("./entities/escalation.entity").Escalation>;
}
