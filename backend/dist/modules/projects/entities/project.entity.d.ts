import { Membership } from '../../memberships/entities/membership.entity';
export declare class Project {
    id: string;
    name: string;
    description: string;
    clientName: string;
    domains: string[];
    keywords: string[];
    knownAddresses: string[];
    archived: boolean;
    createdAt: Date;
    updatedAt: Date;
    memberships: Membership[];
}
