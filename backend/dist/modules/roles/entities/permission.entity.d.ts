import { Role } from './role.entity';
export declare enum PermissionType {
    VIEW_SCOPE = "view_scope",
    ASSIGNMENT = "assignment",
    MEMBER_MANAGEMENT = "member_management",
    EMAIL_SENDING = "email_sending",
    STATUS_CHANGE = "status_change"
}
export declare class Permission {
    id: string;
    type: PermissionType;
    roleId: string;
    role: Role;
}
