import { ProjectRoleType } from '../entities/role.entity';
import { PermissionType } from '../entities/permission.entity';
export declare class CreateRoleDto {
    name: string;
    description?: string;
    type: ProjectRoleType;
    projectId: string;
    permissions?: PermissionType[];
}
