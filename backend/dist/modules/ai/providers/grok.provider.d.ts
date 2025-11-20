import { ConfigService } from '@nestjs/config';
import { IAIProvider, SpamClassificationResult, ProjectClassificationResult, CombinedClassificationResult } from '../interfaces/ai-provider.interface';
export declare class GrokProvider implements IAIProvider {
    private configService;
    private readonly logger;
    private readonly apiKey;
    private readonly apiUrl;
    private readonly client;
    private readonly spamConfidenceThreshold;
    private readonly projectConfidenceThreshold;
    constructor(configService: ConfigService);
    classifySpam(emailContent: string): Promise<SpamClassificationResult>;
    classifyProject(emailContent: string, projectDescriptions: Array<{
        id: string;
        name: string;
        description: string;
        keywords: string[];
    }>): Promise<ProjectClassificationResult>;
    private buildSpamClassificationPrompt;
    private buildProjectClassificationPrompt;
    private parseSpamResponse;
    private parseProjectResponse;
    classifyCombined(emailContent: string, projectDescriptions: Array<{
        id: string;
        name: string;
        description: string;
        keywords: string[];
    }>): Promise<CombinedClassificationResult>;
}
