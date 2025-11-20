export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare enum GlobalRole {
    SUPER_USER = "super_user",
    USER = "user"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    status: UserStatus;
    globalRole: GlobalRole;
    createdAt: Date;
    updatedAt: Date;
}
