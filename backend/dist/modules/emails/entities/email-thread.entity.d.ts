import { Email } from './email.entity';
import { Project } from '../../projects/entities/project.entity';
export declare class EmailThread {
    id: string;
    projectId: string;
    subject: string;
    rootMessageId: string;
    createdAt: Date;
    updatedAt: Date;
    emails: Email[];
    project: Project;
}
