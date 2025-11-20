import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { Role } from '../../roles/entities/role.entity';
export declare class Membership {
    id: string;
    userId: string;
    projectId: string;
    roleId: string;
    joinedAt: Date;
    user: User;
    project: Project;
    role: Role;
}
