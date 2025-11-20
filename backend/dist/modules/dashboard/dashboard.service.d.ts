import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Membership } from '../memberships/entities/membership.entity';
export interface DashboardProject {
    id: string;
    name: string;
    clientName: string;
    description: string;
    role: string;
    openEmailsCount: number;
    lastUpdated: Date;
}
export declare class DashboardService {
    private membershipsRepository;
    private projectsRepository;
    constructor(membershipsRepository: Repository<Membership>, projectsRepository: Repository<Project>);
    getUserProjects(userId: string, isSuperUser: boolean): Promise<DashboardProject[]>;
}
