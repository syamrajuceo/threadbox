import { ConfigService } from '@nestjs/config';
import { IAIProvider, SpamClassificationResult, ProjectClassificationResult, CombinedClassificationResult } from '../interfaces/ai-provider.interface';
export declare class ClaudeProvider implements IAIProvider {
    private configService;
    private readonly logger;
    private readonly apiKey;
    private readonly apiUrl;
    private readonly model;
    private readonly client;
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
    private buildCombinedClassificationPrompt;
    private parseCombinedResponse;
    testConnection(): Promise<{
        status: string;
        responseTime: number;
    }>;
}
