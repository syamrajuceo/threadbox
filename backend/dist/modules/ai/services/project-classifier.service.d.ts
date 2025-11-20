import { Repository } from 'typeorm';
import { ProjectClassificationResult } from '../interfaces/ai-provider.interface';
import { ClaudeProvider } from '../providers/claude.provider';
import { Project } from '../../projects/entities/project.entity';
export declare class ProjectClassifierService {
    private aiProvider;
    private projectsRepository;
    private readonly logger;
    private readonly confidenceThreshold;
    constructor(aiProvider: ClaudeProvider, projectsRepository: Repository<Project>);
    classify(emailContent: string, projectIds?: string[]): Promise<ProjectClassificationResult>;
    shouldAutoAssign(result: ProjectClassificationResult): boolean;
}
