export interface SpamClassificationResult {
    isSpam: boolean;
    confidence: number;
    reason?: string;
}
export interface ProjectClassificationResult {
    projectId: string | null;
    confidence: number;
    reason?: string;
}
export interface CombinedClassificationResult {
    spamClassification: {
        category: 'spam' | 'possible_spam' | 'not_spam';
        confidence: number;
        reason?: string;
    };
    projectClassification: {
        projectId: string | null;
        confidence: number;
        reason?: string;
    };
}
export interface IAIProvider {
    classifySpam(emailContent: string): Promise<SpamClassificationResult>;
    classifyProject(emailContent: string, projectDescriptions: Array<{
        id: string;
        name: string;
        description: string;
        keywords: string[];
    }>): Promise<ProjectClassificationResult>;
    classifyCombined(emailContent: string, projectDescriptions: Array<{
        id: string;
        name: string;
        description: string;
        keywords: string[];
    }>): Promise<CombinedClassificationResult>;
}
