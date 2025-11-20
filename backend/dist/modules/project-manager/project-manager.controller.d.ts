import { ProjectManagerService } from './project-manager.service';
export declare class ProjectManagerController {
    private readonly projectManagerService;
    constructor(projectManagerService: ProjectManagerService);
    getManagedProjects(req: any): Promise<import("../projects/entities/project.entity").Project[]>;
    getProjectEmails(req: any, projectId?: string): Promise<import("../emails/entities/email.entity").Email[]>;
    getUnassignedEmails(req: any, projectId: string): Promise<import("../emails/entities/email.entity").Email[]>;
    getAssignedEmails(req: any, projectId: string): Promise<import("../emails/entities/email.entity").Email[]>;
    getProjectUsers(req: any, projectId: string): Promise<import("../users/entities/user.entity").User[]>;
    getUsersByRole(req: any, projectId: string, roleId: string): Promise<import("../users/entities/user.entity").User[]>;
    getEmailAssignments(req: any, emailId: string): Promise<import("../assignments/entities/email-assignment.entity").EmailAssignment[]>;
    isProjectManager(req: any, projectId: string): Promise<{
        isProjectManager: boolean;
    }>;
}
