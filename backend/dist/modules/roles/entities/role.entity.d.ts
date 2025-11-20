import { Permission } from './permission.entity';
import { Membership } from '../../memberships/entities/membership.entity';
export declare enum ProjectRoleType {
    PROJECT_MANAGER = "project_manager",
    DEVELOPER = "developer",
    TESTER = "tester",
    CUSTOM = "custom"
}
export declare class Role {
    id: string;
    name: string;
    description: string;
    type: ProjectRoleType;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
    permissions: Permission[];
    memberships: Membership[];
}
