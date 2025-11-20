import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GlobalRole } from '../users/entities/user.entity';
import { ClaudeProvider } from './providers/claude.provider';
import { Logger } from '@nestjs/common';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GlobalRole.SUPER_USER)
export class AIController {
  private readonly logger = new Logger(AIController.name);

  constructor(private readonly claudeProvider: ClaudeProvider) {}

  @Get('test-connection')
  async testConnection() {
    try {
      // Make a minimal test call - just ask for a single word response
      // This is extremely low cost (minimal tokens)
      const testResult = await this.claudeProvider.testConnection();
      
      return {
        success: true,
        connected: true,
        message: 'AI connection is working',
        details: testResult,
      };
    } catch (error: any) {
      this.logger.error('AI connection test failed:', error);
      
      return {
        success: false,
        connected: false,
        message: error.message || 'Failed to connect to AI service',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }
  }
}

