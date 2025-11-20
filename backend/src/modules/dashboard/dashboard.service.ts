import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Membership)
    private membershipsRepository: Repository<Membership>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async getUserProjects(
    userId: string,
    isSuperUser: boolean,
  ): Promise<DashboardProject[]> {
    let projects: Project[];

    if (isSuperUser) {
      // Super users see all projects
      projects = await this.projectsRepository.find({
        where: { archived: false },
        order: { updatedAt: 'DESC' },
      });
    } else {
      // Regular users see only their projects
      const memberships = await this.membershipsRepository.find({
        where: { userId },
        relations: ['project', 'role'],
      });
      projects = memberships.map((m) => m.project).filter((p) => !p.archived);
    }

    // Get memberships for role information
    const memberships = await this.membershipsRepository.find({
      where: { userId },
      relations: ['role'],
    });
    const membershipMap = new Map(
      memberships.map((m) => [m.projectId, m.role.name]),
    );

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      clientName: project.clientName,
      description: project.description || '',
      role:
        membershipMap.get(project.id) ||
        (isSuperUser ? 'Super User' : 'Member'),
      openEmailsCount: 0, // TODO: Calculate when emails are implemented
      lastUpdated: project.updatedAt,
    }));
  }
}
