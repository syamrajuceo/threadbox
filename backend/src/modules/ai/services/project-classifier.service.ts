import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectClassificationResult } from '../interfaces/ai-provider.interface';
import { ClaudeProvider } from '../providers/claude.provider';
import { Project } from '../../projects/entities/project.entity';

@Injectable()
export class ProjectClassifierService {
  private readonly logger = new Logger(ProjectClassifierService.name);
  private readonly confidenceThreshold = 0.5; // Lowered from 0.6 to allow more auto-assignments

  constructor(
    private aiProvider: ClaudeProvider,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async classify(
    emailContent: string,
    projectIds?: string[],
  ): Promise<ProjectClassificationResult> {
    try {
      // Get all projects or filter by projectIds
      const projects = projectIds
        ? await this.projectsRepository
            .createQueryBuilder('project')
            .where('project.id IN (:...ids)', { ids: projectIds })
            .getMany()
        : await this.projectsRepository.find();

      if (projects.length === 0) {
        return {
          projectId: null,
          confidence: 0,
          reason: 'No projects available',
        };
      }

      const projectDescriptions = projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        keywords: p.keywords || [],
      }));

      const result = await this.aiProvider.classifyProject(
        emailContent,
        projectDescriptions,
      );

      return result;
    } catch (error) {
      this.logger.error('Error in project classification:', error);
      // Fallback: no project
      return {
        projectId: null,
        confidence: 0,
        reason: 'Classification failed',
      };
    }
  }

  shouldAutoAssign(result: ProjectClassificationResult): boolean {
    return (
      result.projectId !== null &&
      result.confidence >= this.confidenceThreshold
    );
  }
}

