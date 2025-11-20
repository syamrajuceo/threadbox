import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { EmailsService } from './emails.service';
import { UserEmailsService } from './services/user-emails.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GlobalRole } from '../users/entities/user.entity';
import { Email, EmailStatus } from './entities/email.entity';
import { EmailFilterDto } from './dto/email-filter.dto';
import { BulkUpdateDto } from './dto/bulk-update.dto';
import { ResetEmailsDto } from './dto/reset-emails.dto';
import { AuthService } from '../auth/auth.service';

@Controller('emails')
@UseGuards(JwtAuthGuard)
export class EmailsController {
  private readonly logger = new Logger(EmailsController.name);

  constructor(
    private readonly emailsService: EmailsService,
    private readonly userEmailsService: UserEmailsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  findAll(@Query() filters: EmailFilterDto, @Request() req: { user: { id: string; globalRole: GlobalRole } }) {
    // Use UserEmailsService to respect visibility rules
    return this.userEmailsService.getVisibleEmails(
      req.user.id,
      req.user.globalRole,
      {
        projectId: filters.projectId,
        status: filters.status,
        search: filters.search,
      },
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emailsService.findOne(id);
  }

  @Patch('bulk')
  async bulkUpdate(@Body() dto: BulkUpdateDto) {
    const updates: Partial<Email> = {};
    if (dto.projectId) updates.projectId = dto.projectId;
    if (dto.assignedToId) updates.assignedToId = dto.assignedToId;
    if (dto.status) updates.status = dto.status;
    if (dto.projectId || dto.assignedToId) updates.isUnassigned = false;

    await this.emailsService.bulkUpdate(dto.emailIds, updates);
    return { success: true, updated: dto.emailIds.length };
  }

  @Post('reset-all')
  @UseGuards(RolesGuard)
  @Roles(GlobalRole.SUPER_USER)
  async resetAllEmails(
    @Body() dto: ResetEmailsDto,
    @Request() req: any,
  ) {
    try {
      // Verify admin password
      const user = await this.authService.validateUser(
        req.user.email,
        dto.password,
      );

      if (!user) {
        throw new UnauthorizedException('Invalid password');
      }

      if (user.globalRole !== GlobalRole.SUPER_USER) {
        throw new UnauthorizedException('Only super users can reset emails');
      }

      this.logger.warn(
        `Admin ${user.email} is resetting all emails. This is a destructive operation.`,
      );

      const result = await this.emailsService.deleteAllEmails();

      this.logger.log(
        `Successfully deleted ${result.deletedCount} emails by admin ${user.email}`,
      );

      return {
        success: true,
        message: `Successfully deleted ${result.deletedCount} email(s)`,
        deletedCount: result.deletedCount,
      };
    } catch (error: any) {
      this.logger.error('Error resetting emails:', error);
      throw error;
    }
  }
}

