import { AssignmentsService } from './assignments.service';
import { AssignEmailDto } from './dto/assign-email.dto';
import { AssignEmailMultipleDto } from './dto/assign-email-multiple.dto';
import { UpdateEmailStatusDto } from './dto/update-email-status.dto';
export declare class AssignmentsController {
    private readonly assignmentsService;
    constructor(assignmentsService: AssignmentsService);
    assignEmail(id: string, dto: AssignEmailDto, req: any): Promise<import("../emails/entities/email.entity").Email>;
    assignEmailToMultiple(id: string, dto: AssignEmailMultipleDto, req: {
        user: {
            id: string;
        };
    }): Promise<import("./entities/email-assignment.entity").EmailAssignment[]>;
    getEmailAssignments(id: string): Promise<EmailAssignment[]>;
    updateStatus(id: string, dto: UpdateEmailStatusDto): Promise<import("../emails/entities/email.entity").Email>;
}
