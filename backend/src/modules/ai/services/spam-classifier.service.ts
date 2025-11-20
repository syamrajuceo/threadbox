import { Injectable, Logger } from '@nestjs/common';
import { IAIProvider, SpamClassificationResult } from '../interfaces/ai-provider.interface';
import { ClaudeProvider } from '../providers/claude.provider';

@Injectable()
export class SpamClassifierService {
  private readonly logger = new Logger(SpamClassifierService.name);
  private readonly spamThreshold = 0.7; // High confidence spam
  private readonly possibleSpamThreshold = 0.4; // Lower threshold for possible spam

  constructor(private aiProvider: ClaudeProvider) {}

  async classify(emailContent: string): Promise<SpamClassificationResult> {
    try {
      // Clean and prepare email content
      const cleanContent = emailContent.trim();
      if (!cleanContent || cleanContent.length < 10) {
        this.logger.warn('Email content too short for classification');
        return {
          isSpam: false,
          confidence: 0,
          reason: 'Email content too short',
        };
      }

      const result = await this.aiProvider.classifySpam(cleanContent);
      
      this.logger.debug(
        `Spam classification result: isSpam=${result.isSpam}, confidence=${result.confidence}`,
      );
      
      return result;
    } catch (error) {
      this.logger.error('Error in spam classification:', error);
      // Fallback: not spam (safer default)
      return {
        isSpam: false,
        confidence: 0,
        reason: 'Classification failed - defaulting to not spam',
      };
    }
  }

  shouldMarkAsSpam(result: SpamClassificationResult): boolean {
    // Mark as spam if AI says it's spam with high confidence
    return result.isSpam && result.confidence >= this.spamThreshold;
  }

  shouldFlagForReview(result: SpamClassificationResult): boolean {
    // Flag for review if it's spam but confidence is between possible spam threshold and spam threshold
    // OR if it's not clearly spam but has some suspicious indicators (lower confidence spam)
    return (
      (result.isSpam && 
       result.confidence >= this.possibleSpamThreshold && 
       result.confidence < this.spamThreshold) ||
      (!result.isSpam && result.confidence > 0.3) // Suspicious but not spam
    );
  }
}

