import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  IAIProvider,
  SpamClassificationResult,
  ProjectClassificationResult,
  CombinedClassificationResult,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class ClaudeProvider implements IAIProvider {
  private readonly logger = new Logger(ClaudeProvider.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly model: string;
  private readonly client: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('CLAUDE_API_KEY', '');
    this.apiUrl = this.configService.get<string>(
      'CLAUDE_API_URL',
      'https://api.anthropic.com/v1',
    );
    this.model = this.configService.get<string>(
      'CLAUDE_MODEL',
      'claude-3-5-sonnet-20241022',
    );

    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds timeout
    });
  }

  async classifySpam(emailContent: string): Promise<SpamClassificationResult> {
    try {
      if (!this.apiKey) {
        this.logger.warn(
          'CLAUDE_API_KEY is not configured. AI classification will not work.',
        );
        return {
          isSpam: false,
          confidence: 0,
          reason: 'CLAUDE_API_KEY not configured',
        };
      }

      const prompt = this.buildSpamClassificationPrompt(emailContent);

      const response = await this.client.post('/messages', {
        model: this.model,
        max_tokens: 500,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const result = this.parseSpamResponse(
        response.data as { content?: string | Array<{ text?: string }> },
      );
      return result;
    } catch (error: unknown) {
      this.logger.error('Error classifying spam with Claude:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorResponse = (error as { response?: { data?: unknown } })
        ?.response?.data;
      this.logger.error('Error details:', errorResponse || errorMessage);
      // Fallback: mark as not spam if AI is unavailable
      return {
        isSpam: false,
        confidence: 0,
        reason: 'AI service unavailable',
      };
    }
  }

  async classifyProject(
    emailContent: string,
    projectDescriptions: Array<{
      id: string;
      name: string;
      description: string;
      keywords: string[];
    }>,
  ): Promise<ProjectClassificationResult> {
    try {
      if (!this.apiKey) {
        this.logger.warn(
          'CLAUDE_API_KEY is not configured. AI classification will not work.',
        );
        return {
          projectId: null,
          confidence: 0,
          reason: 'CLAUDE_API_KEY not configured',
        };
      }

      if (projectDescriptions.length === 0) {
        this.logger.warn('No projects available for classification');
        return {
          projectId: null,
          confidence: 0,
          reason: 'No projects available',
        };
      }

      const prompt = this.buildProjectClassificationPrompt(
        emailContent,
        projectDescriptions,
      );

      this.logger.debug(
        `Calling Claude API for project classification. Projects: ${projectDescriptions.length}`,
      );

      const response = await this.client.post('/messages', {
        model: this.model,
        max_tokens: 1000,
        temperature: 0.2, // Lower temperature for more consistent results
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const result = this.parseProjectResponse(
        response.data as { content?: string | Array<{ text?: string }> },
        projectDescriptions,
      );

      this.logger.debug(
        `Claude classification result: projectId=${result.projectId}, confidence=${result.confidence}`,
      );

      return result;
    } catch (error: unknown) {
      this.logger.error('Error classifying project with Claude:', error);
      const errorWithResponse = error as {
        response?: { data?: unknown };
        message?: string;
      };
      const errorMessage = errorWithResponse.message || 'Unknown error';
      this.logger.error(
        'Error details:',
        errorWithResponse.response?.data || errorMessage,
      );
      // Fallback: return null project if AI is unavailable
      return {
        projectId: null,
        confidence: 0,
        reason: `AI service error: ${errorMessage}`,
      };
    }
  }

  private buildSpamClassificationPrompt(emailContent: string): string {
    const truncatedContent = emailContent.substring(0, 3000);

    return `You are an expert email spam detection system. Analyze the following email carefully and determine if it is spam, possible spam, or legitimate email.

Consider these spam indicators:
- Suspicious sender addresses or domains
- Urgent language asking for personal information or money
- Poor grammar and spelling errors
- Suspicious links or attachments
- Unusual requests or offers that seem too good to be true
- Phishing attempts (asking for passwords, account details)
- Promotional content from unknown senders
- Generic greetings ("Dear Customer" instead of your name)
- Threats or urgency ("Your account will be closed")
- Requests for immediate action

Email content:
${truncatedContent}

Analyze this email and respond ONLY with valid JSON in this exact format (no markdown, no code blocks, just the JSON):
{
  "isSpam": true or false,
  "confidence": a number between 0.0 and 1.0,
  "reason": explain why you classified it this way
}

Respond with ONLY the JSON object, nothing else.`;
  }

  private buildProjectClassificationPrompt(
    emailContent: string,
    projects: Array<{
      id: string;
      name: string;
      description: string;
      keywords: string[];
    }>,
  ): string {
    const projectsList = projects
      .map(
        (p) =>
          `Project ID: ${p.id}\nName: ${p.name}\nDescription: ${p.description}\nKeywords: ${p.keywords.join(', ') || 'None'}`,
      )
      .join('\n\n');

    const truncatedContent = emailContent.substring(0, 3000);

    return `You are an expert email routing system. Analyze the following email and determine which project it belongs to based on the project descriptions, keywords, and email content.

Available projects:
${projectsList}

Email content:
${truncatedContent}

Analysis guidelines:
- Match email content (subject, body, sender domain) to project descriptions and keywords
- Consider client names, project names, and domain names mentioned in projects
- Look for keywords from the project's keyword list in the email
- Consider the context and purpose of the email
- If the email clearly matches a project with high confidence (0.7+), assign it
- If there's a moderate match (0.5-0.69), you can still assign but with lower confidence
- Only set projectId to null if there's no clear match (confidence < 0.5)

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, just the JSON):
{
  "projectId": "exact-project-id-from-list-above or null",
  "confidence": a number between 0.0 and 1.0,
  "reason": "a brief explanation of why you assigned it to this project or why it's null"
}

Important: Use the EXACT Project ID from the list above. Do not invent IDs.`;
  }

  private parseSpamResponse(data: {
    content?: string | Array<{ text?: string }>;
  }): SpamClassificationResult {
    try {
      let content = '';

      // Claude API returns content in a different format
      if (data.content && Array.isArray(data.content)) {
        // Claude returns content as an array of content blocks
        content = data.content
          .map((block: { text?: string }) => block.text || '')
          .join('');
      } else if (data.content && typeof data.content === 'string') {
        content = data.content;
      } else {
        content = JSON.stringify(data);
      }

      // Clean up the response - remove markdown code blocks if present
      content = content.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/```\n?/g, '');
      }

      // Try to extract JSON if it's embedded in text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }

      const parsed = JSON.parse(content) as {
        isSpam?: boolean | string;
        confidence?: number | string;
        reason?: string;
      };

      const isSpam = parsed.isSpam === true || parsed.isSpam === 'true';
      const confidence = Math.max(
        0,
        Math.min(1, parseFloat(String(parsed.confidence || 0)) || 0),
      );
      const reason = parsed.reason || 'No reason provided';

      this.logger.debug(
        `Spam classification: isSpam=${isSpam}, confidence=${confidence}, reason=${reason}`,
      );

      return {
        isSpam,
        confidence,
        reason,
      };
    } catch (error) {
      this.logger.error('Error parsing spam classification response:', error);
      this.logger.error('Raw response:', JSON.stringify(data, null, 2));
      return {
        isSpam: false,
        confidence: 0,
        reason: 'Failed to parse AI response',
      };
    }
  }

  private parseProjectResponse(
    data: { content?: string | Array<{ text?: string }> },
    projects: Array<{ id: string }>,
  ): ProjectClassificationResult {
    try {
      let content = '';

      // Claude API returns content in a different format
      if (data.content && Array.isArray(data.content)) {
        // Claude returns content as an array of content blocks
        content = data.content
          .map((block: { text?: string }) => block.text || '')
          .join('');
      } else if (data.content && typeof data.content === 'string') {
        content = data.content;
      } else {
        content = JSON.stringify(data);
      }

      // Clean up the response - remove markdown code blocks if present
      content = content.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/```\n?/g, '');
      }

      // Try to extract JSON if it's embedded in text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }

      const parsed = JSON.parse(content) as {
        projectId?: string | null;
        confidence?: number | string;
        reason?: string;
      };

      const projectId = parsed.projectId || null;
      const confidence = Math.max(
        0,
        Math.min(1, parseFloat(String(parsed.confidence || 0)) || 0),
      );

      this.logger.debug(
        `Project classification: projectId=${projectId}, confidence=${confidence}, reason=${parsed.reason || 'No reason'}`,
      );

      // Validate project ID exists
      if (projectId && !projects.find((p) => p.id === projectId)) {
        this.logger.warn(
          `Invalid project ID returned by AI: ${projectId}. Available projects: ${projects.map((p) => p.id).join(', ')}`,
        );
        return {
          projectId: null,
          confidence: 0,
          reason: 'Invalid project ID returned by AI',
        };
      }

      return {
        projectId,
        confidence,
        reason: parsed.reason || 'No reason provided',
      };
    } catch (error) {
      this.logger.error(
        'Error parsing project classification response:',
        error,
      );
      this.logger.error('Raw response:', JSON.stringify(data, null, 2));
      return {
        projectId: null,
        confidence: 0,
        reason: 'Failed to parse AI response',
      };
    }
  }

  async classifyCombined(
    emailContent: string,
    projectDescriptions: Array<{
      id: string;
      name: string;
      description: string;
      keywords: string[];
    }>,
  ): Promise<CombinedClassificationResult> {
    try {
      if (!this.apiKey) {
        this.logger.warn(
          'CLAUDE_API_KEY is not configured. AI classification will not work.',
        );
        return {
          spamClassification: {
            category: 'not_spam',
            confidence: 0,
            reason: 'CLAUDE_API_KEY not configured',
          },
          projectClassification: {
            projectId: null,
            confidence: 0,
            reason: 'CLAUDE_API_KEY not configured',
          },
        };
      }

      if (projectDescriptions.length === 0) {
        this.logger.warn('No projects available for classification');
        return {
          spamClassification: {
            category: 'not_spam',
            confidence: 0,
            reason: 'No projects available',
          },
          projectClassification: {
            projectId: null,
            confidence: 0,
            reason: 'No projects available',
          },
        };
      }

      const prompt = this.buildCombinedClassificationPrompt(
        emailContent,
        projectDescriptions,
      );

      const response = await this.client.post('/messages', {
        model: this.model,
        max_tokens: 300, // Reduced since we're combining both classifications
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const result = this.parseCombinedResponse(
        response.data as { content?: string | Array<{ text?: string }> },
        projectDescriptions,
      );
      return result;
    } catch (error: unknown) {
      this.logger.error('Error in combined classification with Claude:', error);
      const errorWithResponse = error as {
        response?: { data?: unknown };
        message?: string;
      };
      const errorMessage = errorWithResponse.message || 'Unknown error';
      this.logger.error(
        'Error details:',
        errorWithResponse.response?.data || errorMessage,
      );
      return {
        spamClassification: {
          category: 'not_spam',
          confidence: 0,
          reason: `AI service error: ${errorMessage}`,
        },
        projectClassification: {
          projectId: null,
          confidence: 0,
          reason: `AI service error: ${(error as { message?: string })?.message || 'Unknown error'}`,
        },
      };
    }
  }

  private buildCombinedClassificationPrompt(
    emailContent: string,
    projects: Array<{
      id: string;
      name: string;
      description: string;
      keywords: string[];
    }>,
  ): string {
    const projectsList = projects
      .map(
        (p) =>
          `Project ID: ${p.id}\nName: ${p.name}\nDescription: ${p.description}\nKeywords: ${p.keywords.join(', ') || 'None'}`,
      )
      .join('\n\n');

    const truncatedContent = emailContent.substring(0, 2000); // Reduced from 3000

    return `Analyze this email and classify it in ONE step:

1. SPAM CLASSIFICATION: Determine if it's spam, possible spam, or legitimate
   - "spam": Clear spam (phishing, scams, obvious junk)
   - "possible_spam": Suspicious but uncertain (needs manual review)
   - "not_spam": Legitimate email

2. PROJECT CLASSIFICATION: If not_spam, determine which project it belongs to

Available projects:
${projectsList}

Email content:
${truncatedContent}

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "spamCategory": "spam" | "possible_spam" | "not_spam",
  "spamConfidence": 0.0-1.0,
  "spamReason": "brief explanation",
  "projectId": "exact-project-id-from-list or null",
  "projectConfidence": 0.0-1.0,
  "projectReason": "brief explanation"
}

Rules:
- If spamCategory is "spam" → set projectId to null (skip project classification)
- If spamCategory is "possible_spam" → set projectId to null (needs manual review)
- If spamCategory is "not_spam" → classify project (only if confidence >= 0.5)`;
  }

  private parseCombinedResponse(
    data: { content?: string | Array<{ text?: string }> },
    projects: Array<{ id: string }>,
  ): CombinedClassificationResult {
    try {
      let content = '';

      if (data.content && Array.isArray(data.content)) {
        content = data.content
          .map((block: { text?: string }) => block.text || '')
          .join('');
      } else if (data.content && typeof data.content === 'string') {
        content = data.content;
      }

      content = content.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/```\n?/g, '');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }

      const parsed = JSON.parse(content) as {
        spamCategory?: string;
        spamConfidence?: number | string;
        spamReason?: string;
        projectId?: string | null;
        projectConfidence?: number | string;
        projectReason?: string;
      };

      const spamCategory = parsed.spamCategory || 'not_spam';
      const spamConfidence = Math.max(
        0,
        Math.min(1, parseFloat(String(parsed.spamConfidence || 0)) || 0),
      );

      let projectId: string | null = parsed.projectId || null;
      const projectConfidence = Math.max(
        0,
        Math.min(1, parseFloat(String(parsed.projectConfidence || 0)) || 0),
      );

      // Validate project ID
      if (projectId && !projects.find((p) => p.id === projectId)) {
        this.logger.warn(
          `Invalid project ID returned by AI: ${projectId}. Available projects: ${projects.map((p) => p.id).join(', ')}`,
        );
        projectId = null;
      }

      // If spam or possible_spam, ensure projectId is null
      if (spamCategory === 'spam' || spamCategory === 'possible_spam') {
        projectId = null;
      }

      return {
        spamClassification: {
          category: spamCategory as 'spam' | 'possible_spam' | 'not_spam',
          confidence: spamConfidence,
          reason: String(parsed.spamReason || 'No reason provided'),
        },
        projectClassification: {
          projectId,
          confidence: projectConfidence,
          reason: String(parsed.projectReason || 'No reason provided'),
        },
      };
    } catch (error: unknown) {
      this.logger.error(
        'Error parsing combined classification response:',
        error,
      );
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Raw response:', JSON.stringify(data, null, 2));
      return {
        spamClassification: {
          category: 'not_spam',
          confidence: 0,
          reason: `Failed to parse AI response: ${errorMessage}`,
        },
        projectClassification: {
          projectId: null,
          confidence: 0,
          reason: `Failed to parse AI response: ${errorMessage}`,
        },
      };
    }
  }

  /**
   * Test connection to Claude API with minimal cost
   * Makes a very simple request that costs almost nothing
   */
  async testConnection(): Promise<{ status: string; responseTime: number }> {
    const startTime = Date.now();

    try {
      if (!this.apiKey) {
        throw new Error('CLAUDE_API_KEY is not configured');
      }

      // Make a minimal test call - just ask for a single word response
      // This uses minimal tokens and costs almost nothing
      const response = await this.client.post('/messages', {
        model: this.model,
        max_tokens: 5, // Minimal tokens - just need "ok" or "test"
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: 'Say "ok"',
          },
        ],
      });

      const responseTime = Date.now() - startTime;

      // Extract response text
      let responseText = '';
      const responseData = response.data as {
        content?: string | Array<{ text?: string }>;
      };
      if (responseData.content && Array.isArray(responseData.content)) {
        responseText = responseData.content
          .map((block: { text?: string }) => block.text || '')
          .join('');
      } else if (
        responseData.content &&
        typeof responseData.content === 'string'
      ) {
        responseText = responseData.content;
      }

      this.logger.log(
        `AI connection test successful. Response: ${responseText}, Time: ${responseTime}ms`,
      );

      return {
        status: 'connected',
        responseTime,
      };
    } catch (error: unknown) {
      this.logger.error('AI connection test failed:', error);

      const errorWithResponse = error as {
        response?: { status?: number; data?: { error?: { message?: string } } };
        code?: string;
        message?: string;
      };
      if (errorWithResponse.response?.status === 401) {
        throw new Error('Invalid API key. Please check your CLAUDE_API_KEY.');
      } else if (errorWithResponse.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (
        errorWithResponse.code === 'ECONNREFUSED' ||
        errorWithResponse.code === 'ENOTFOUND'
      ) {
        throw new Error(
          'Cannot connect to Claude API. Please check your network connection.',
        );
      } else {
        throw new Error(
          errorWithResponse.response?.data?.error?.message ||
            errorWithResponse.message ||
            'Failed to connect to Claude API',
        );
      }
    }
  }
}
