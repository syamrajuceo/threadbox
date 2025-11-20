import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  ValidationPipe,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { EmailIngestionService } from './email-ingestion.service';
import { IngestEmailsDto } from './dto/ingest-emails.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GlobalRole } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('email-ingestion')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GlobalRole.SUPER_USER)
export class EmailIngestionController {
  private readonly logger = new Logger(EmailIngestionController.name);

  constructor(
    private readonly emailIngestionService: EmailIngestionService,
  ) {}

  @Post('ingest')
  async ingestEmails(
    @Body(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))
    ingestDto: IngestEmailsDto,
  ) {
    try {
      const config = {
        provider: ingestDto.provider,
        account: ingestDto.account,
        credentials: ingestDto.credentials,
      };

      this.logger.log(`Ingesting emails for ${config.provider} account: ${config.account}`);
      
      const count = await this.emailIngestionService.ingestEmails(
        config,
        ingestDto.since,
      );

      return {
        success: true,
        ingested: count,
        message: `Successfully ingested ${count} email(s)`,
      };
    } catch (error: unknown) {
      this.logger.error('Email ingestion error:', error);
      
      // Return error response instead of throwing exception
      // This allows frontend to handle the error gracefully
      return {
        success: false,
        ingested: 0,
        message: error.message || 'Failed to ingest emails. Please check your credentials and try again.',
      };
    }
  }

  @Get('status')
  async getStatus() {
    return {
      status: 'ready',
      message: 'Email ingestion service is ready',
    };
  }
}

