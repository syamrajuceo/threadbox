import { SpamClassificationResult } from '../interfaces/ai-provider.interface';
import { ClaudeProvider } from '../providers/claude.provider';
export declare class SpamClassifierService {
    private aiProvider;
    private readonly logger;
    private readonly spamThreshold;
    private readonly possibleSpamThreshold;
    constructor(aiProvider: ClaudeProvider);
    classify(emailContent: string): Promise<SpamClassificationResult>;
    shouldMarkAsSpam(result: SpamClassificationResult): boolean;
    shouldFlagForReview(result: SpamClassificationResult): boolean;
}
