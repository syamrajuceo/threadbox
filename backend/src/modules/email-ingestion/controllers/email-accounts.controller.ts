import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { EmailAccountsService } from '../services/email-accounts.service';
import { CreateEmailAccountDto } from '../dto/create-email-account.dto';
import { UpdateEmailAccountDto } from '../dto/update-email-account.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GlobalRole } from '../../users/entities/user.entity';

@Controller('email-accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GlobalRole.SUPER_USER)
export class EmailAccountsController {
  private readonly logger = new Logger(EmailAccountsController.name);

  constructor(private readonly emailAccountsService: EmailAccountsService) {}

  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))
    createDto: CreateEmailAccountDto,
    @Request() req: any,
  ) {
    try {
      this.logger.log(`Creating email account: ${createDto.name} (${createDto.provider})`);
      const account = await this.emailAccountsService.create(createDto, req.user.id);
      this.logger.log(`Email account created successfully: ${account.id}`);
      return account;
    } catch (error: unknown) {
      this.logger.error('Error creating email account:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create email account';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Error message:', errorMessage);
      if (errorStack) {
        this.logger.error('Error stack:', errorStack);
      }
      
      // Return error response instead of throwing
      return {
        error: true,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      };
    }
  }

  @Get()
  async findAll(@Request() req: { user: { id: string } }) {
    return this.emailAccountsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.emailAccountsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))
    updateDto: UpdateEmailAccountDto,
    @Request() req: any,
  ) {
    try {
      this.logger.log(`Updating email account: ${id}`);
      const account = await this.emailAccountsService.update(id, updateDto, req.user.id);
      this.logger.log(`Email account updated successfully: ${account.id}`);
      return account;
    } catch (error: unknown) {
      this.logger.error('Error updating email account:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update email account';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Error message:', errorMessage);
      if (errorStack) {
        this.logger.error('Error stack:', errorStack);
      }
      
      // Return error response instead of throwing
      return {
        error: true,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.emailAccountsService.remove(id, req.user.id);
    return { success: true };
  }

  @Post(':id/ingest')
  async ingest(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Query('since') since?: string,
  ) {
    try {
      this.logger.log(`=== Email Ingestion Request ===`);
      this.logger.log(`Account ID: ${id}`);
      this.logger.log(`Since parameter received: ${since || 'NOT PROVIDED'}`);
      
      // Parse the date string - handle both ISO strings and datetime-local format
      let sinceDate: Date | undefined = undefined;
      if (since) {
        // Handle datetime-local format (YYYY-MM-DDTHH:mm) and ISO format
        sinceDate = new Date(String(since));
        if (isNaN(sinceDate.getTime())) {
          this.logger.error(`❌ Invalid date format provided: ${since}. Ignoring date filter.`);
          sinceDate = undefined;
        } else {
          this.logger.log(`✅ Date filter parsed successfully: ${sinceDate.toISOString()}`);
          this.logger.log(`   Local time: ${sinceDate.toLocaleString()}`);
          this.logger.log(`   UTC time: ${sinceDate.toUTCString()}`);
        }
      } else {
        this.logger.warn('⚠️  No date filter provided - will fetch ALL emails');
      }
      
      const count = await this.emailAccountsService.ingestFromAccount(
        id,
        req.user.id,
        sinceDate,
      );

      return {
        success: true,
        ingested: count,
        message: `Successfully ingested ${count} email(s)`,
      };
    } catch (error: any) {
      return {
        success: false,
        ingested: 0,
        message: error.message || 'Failed to ingest emails. Please check your credentials and try again.',
      };
    }
  }
}

