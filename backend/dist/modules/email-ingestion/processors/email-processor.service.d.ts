import { Repository } from 'typeorm';
import { Email } from '../../emails/entities/email.entity';
import { SpamClassifierService } from '../../ai/services/spam-classifier.service';
import { ProjectClassifierService } from '../../ai/services/project-classifier.service';
import { ClaudeProvider } from '../../ai/providers/claude.provider';
import { Project } from '../../projects/entities/project.entity';
export declare class EmailProcessorService {
    private emailsRepository;
    private projectsRepository;
    private spamClassifier;
    private projectClassifier;
    private aiProvider;
    private readonly logger;
    constructor(emailsRepository: Repository<Email>, projectsRepository: Repository<Project>, spamClassifier: SpamClassifierService, projectClassifier: ProjectClassifierService, aiProvider: ClaudeProvider);
    processEmail(email: Email): Promise<Email>;
    processBatch(emails: Email[]): Promise<Email[]>;
}
