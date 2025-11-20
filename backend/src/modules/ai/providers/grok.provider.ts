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
export class GrokProvider implements IAIProvider {
  private readonly logger = new Logger(GrokProvider.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly client: AxiosInstance;
  private readonly spamConfidenceThreshold = 0.7;
  private readonly projectConfidenceThreshold = 0.6;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GROK_API_KEY', '');
    this.apiUrl =
      this.configService.get<string>('GROK_API_URL', 'https://api.x.ai/v1');

    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async classifySpam(emailContent: string): Promise<SpamClassificationResult> {
    try {
      const prompt = this.buildSpamClassificationPrompt(emailContent);

      const response = await this.client.post('/chat/completions', {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content:
              'You are an email spam detection system. Analyze emails and determine if they are spam.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const result = this.parseSpamResponse(response.data);
      return result;
    } catch (error: any) {
      this.logger.error('Error classifying spam with Grok:', error);
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
        this.logger.warn('GROK_API_KEY is not configured. AI classification will not work.');
        return {
          projectId: null,
          confidence: 0,
          reason: 'GROK_API_KEY not configured',
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
        `Calling Grok API for project classification. Projects: ${projectDescriptions.length}`,
      );

      const response = await this.client.post('/chat/completions', {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert email routing system. Analyze emails and determine which project they belong to based on project descriptions, keywords, client names, and email content. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2, // Lower temperature for more consistent results
        max_tokens: 500, // Increased to allow more detailed responses
      });

      const result = this.parseProjectResponse(
        response.data,
        projectDescriptions,
      );

      this.logger.debug(
        `Grok classification result: projectId=${result.projectId}, confidence=${result.confidence}`,
      );

      return result;
    } catch (error: unknown) {
      this.logger.error('Error classifying project with Grok:', error);
      const errorWithResponse = error as { response?: { data?: unknown }; message?: string };
      const errorMessage = errorWithResponse.message || 'Unknown error';
      this.logger.error('Error details:', errorWithResponse.response?.data || errorMessage);
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
  "reason": "a brief explanation of your classification"
}

Classification rules:
- isSpam: true if clearly spam, false if legitimate or uncertain
- confidence: 0.9-1.0 for obvious spam, 0.7-0.89 for likely spam, 0.4-0.69 for possible spam, 0.0-0.39 for legitimate
- reason: explain why you classified it this way

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

  private parseSpamResponse(data: { choices?: Array<{ message?: { content?: string } }> }): SpamClassificationResult {
    try {
      let content: string = data.choices?.[0]?.message?.content || '{}';
      
      // Clean up the response - remove markdown code blocks if present
      content = String(content).trim();
      if (content.startsWith('```json')) {
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/```\n?/g, '');
      }
      
      // Try to extract JSON if it's embedded in text
      const jsonMatch: RegExpMatchArray | null = content.match(/\{[\s\S]*\}/);
      if (jsonMatch && jsonMatch[0]) {
        content = jsonMatch[0];
      }
      
      const parsed = JSON.parse(content) as {
        isSpam?: boolean | string;
        confidence?: number | string;
        reason?: string;
      };

      const isSpam = parsed.isSpam === true || parsed.isSpam === 'true';
      const confidence = Math.max(0, Math.min(1, parseFloat(String(parsed.confidence || 0)) || 0));
      const reason = parsed.reason || 'No reason provided';

      this.logger.debug(`Spam classification: isSpam=${isSpam}, confidence=${confidence}, reason=${String(reason)}`);

      return {
        isSpam,
        confidence,
        reason,
      };
    } catch (error) {
      this.logger.error('Error parsing spam classification response:', error);
      this.logger.error('Raw response:', data.choices?.[0]?.message?.content);
      return {
        isSpam: false,
        confidence: 0,
        reason: 'Failed to parse AI response',
      };
    }
  }

  private parseProjectResponse(
    data: { choices?: Array<{ message?: { content?: string } }> },
    projects: Array<{ id: string }>,
  ): ProjectClassificationResult {
    try {
      let content: string = data.choices?.[0]?.message?.content || '{}';

      // Clean up the response - remove markdown code blocks if present
      content = String(content).trim();
      if (content.startsWith('```json')) {
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/```\n?/g, '');
      }

      // Try to extract JSON if it's embedded in text
      const jsonMatch: RegExpMatchArray | null = content.match(/\{[\s\S]*\}/);
      if (jsonMatch && jsonMatch[0]) {
        content = jsonMatch[0];
      }

      const parsed = JSON.parse(content) as {
        projectId?: string | null;
        confidence?: number | string;
        reason?: string;
      };

      const projectId: string | null = parsed.projectId || null;
      const confidence = Math.max(0, Math.min(1, parseFloat(String(parsed.confidence || 0)) || 0));

      this.logger.debug(
        `Project classification: projectId=${String(projectId)}, confidence=${confidence}, reason=${String(parsed.reason || 'No reason')}`,
      );

      // Validate project ID exists
      if (projectId && !projects.find((p) => p.id === projectId)) {
        this.logger.warn(
          `Invalid project ID returned by AI: ${String(projectId)}. Available projects: ${projects.map((p) => String(p.id)).join(', ')}`,
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
      this.logger.error('Error parsing project classification response:', error);
      this.logger.error('Raw response:', data.choices?.[0]?.message?.content);
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
    // Grok provider: Use sequential calls (less efficient than Claude's combined approach)
    // This is a fallback implementation since Grok is deprecated
    try {
      const spamResult = await this.classifySpam(emailContent);
      
      // Determine spam category
      let spamCategory: 'spam' | 'possible_spam' | 'not_spam' = 'not_spam';
      if (spamResult.isSpam && spamResult.confidence >= 0.7) {
        spamCategory = 'spam';
      } else if (spamResult.isSpam && spamResult.confidence >= 0.4) {
        spamCategory = 'possible_spam';
      }

      // Only classify project if not spam
      let projectResult: ProjectClassificationResult = {
        projectId: null,
        confidence: 0,
        reason: 'Skipped due to spam classification',
      };

      if (spamCategory === 'not_spam') {
        projectResult = await this.classifyProject(emailContent, projectDescriptions);
      }

      return {
        spamClassification: {
          category: spamCategory,
          confidence: spamResult.confidence,
          reason: spamResult.reason,
        },
        projectClassification: {
          projectId: projectResult.projectId,
          confidence: projectResult.confidence,
          reason: projectResult.reason,
        },
      };
    } catch (error: any) {
      this.logger.error('Error in combined classification with Grok:', error);
      return {
        spamClassification: {
          category: 'not_spam',
          confidence: 0,
          reason: `AI service error: ${error.message || 'Unknown error'}`,
        },
        projectClassification: {
          projectId: null,
          confidence: 0,
          reason: `AI service error: ${error.message || 'Unknown error'}`,
        },
      };
    }
  }
}

