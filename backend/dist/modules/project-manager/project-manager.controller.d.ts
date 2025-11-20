import { ProjectManagerService } from './project-manager.service';
export declare class ProjectManagerController {
    private readonly projectManagerService;
    constructor(projectManagerService: ProjectManagerService);
    getManagedProjects(req: {
        user: {
            id: string;
        };
    }): Promise<import("../projects/entities/project.entity").Project[]>;
    getProjectEmails(req: {
        user: {
            id: string;
        };
    }, projectId?: string): Promise<import("../emails/entities/email.entity").Email[]>;
    getUnassignedEmails(req: {
        user: {
            id: string;
        };
    }, projectId: string): Promise<import("../emails/entities/email.entity").Email[]>;
    getAssignedEmails(req: {
        user: {
            id: string;
        };
    }, projectId: string): Promise<import("../emails/entities/email.entity").Email[]>;
    getProjectUsers(req: {
        user: {
            id: string;
        };
    }, projectId: string): Promise<import("../users/entities/user.entity").User[]>;
    getUsersByRole(req: {
        user: {
            id: string;
        };
    }, projectId: string, roleId: string): Promise<import("../users/entities/user.entity").User[]>;
    getEmailAssignments(req: {
        user: {
            id: string;
        };
    }, emailId: string): Promise<import("../assignments/entities/email-assignment.entity").EmailAssignment[]>;
    isProjectManager(req: {
        user: {
            id: string;
        };
    }, projectId: string): Promise<{
        isProjectManager: boolean;
    }>;
}
