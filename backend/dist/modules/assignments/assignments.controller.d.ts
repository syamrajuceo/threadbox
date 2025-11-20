import { AssignmentsService } from './assignments.service';
import { AssignEmailDto } from './dto/assign-email.dto';
import { AssignEmailMultipleDto } from './dto/assign-email-multiple.dto';
import { UpdateEmailStatusDto } from './dto/update-email-status.dto';
import { EmailAssignment } from './entities/email-assignment.entity';
export declare class AssignmentsController {
    private readonly assignmentsService;
    constructor(assignmentsService: AssignmentsService);
    assignEmail(id: string, dto: AssignEmailDto, req: {
        user: {
            firstName: string;
            lastName: string;
        };
    }): Promise<import("../emails/entities/email.entity").Email>;
    assignEmailToMultiple(id: string, dto: AssignEmailMultipleDto, req: {
        user: {
            id: string;
        };
    }): Promise<EmailAssignment[]>;
    getEmailAssignments(id: string): Promise<EmailAssignment[]>;
    updateStatus(id: string, dto: UpdateEmailStatusDto): Promise<import("../emails/entities/email.entity").Email>;
}
