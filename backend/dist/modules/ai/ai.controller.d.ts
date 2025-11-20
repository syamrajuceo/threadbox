import { ClaudeProvider } from './providers/claude.provider';
export declare class AIController {
    private readonly claudeProvider;
    private readonly logger;
    constructor(claudeProvider: ClaudeProvider);
    testConnection(): Promise<{
        success: boolean;
        connected: boolean;
        message: string;
        details: {
            status: string;
            responseTime: number;
        };
        error?: undefined;
    } | {
        success: boolean;
        connected: boolean;
        message: string;
        error: string | undefined;
        details?: undefined;
    }>;
}
