import { Repository } from 'typeorm';
import { Email } from '../emails/entities/email.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { EmailAssignment } from '../assignments/entities/email-assignment.entity';
export declare class ProjectManagerService {
    private membershipsRepository;
    private emailsRepository;
    private usersRepository;
    private emailAssignmentsRepository;
    constructor(membershipsRepository: Repository<Membership>, emailsRepository: Repository<Email>, usersRepository: Repository<User>, emailAssignmentsRepository: Repository<EmailAssignment>);
    isProjectManager(userId: string, projectId: string): Promise<boolean>;
    getManagedProjects(userId: string): Promise<Project[]>;
    getProjectEmails(userId: string, projectId?: string): Promise<Email[]>;
    getUnassignedProjectEmails(userId: string, projectId: string): Promise<Email[]>;
    getAssignedProjectEmails(userId: string, projectId: string): Promise<Email[]>;
    getProjectUsers(projectId: string, userId: string): Promise<User[]>;
    getUsersByRole(projectId: string, roleId: string, userId: string): Promise<User[]>;
    getEmailAssignments(emailId: string, userId: string): Promise<EmailAssignment[]>;
}
