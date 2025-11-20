import { GlobalRole } from '../../users/entities/user.entity';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: GlobalRole[]) => import("@nestjs/common").CustomDecorator<string>;
