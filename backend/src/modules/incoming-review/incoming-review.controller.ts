import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IncomingReviewService } from './incoming-review.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GlobalRole } from '../users/entities/user.entity';
import { EmailSpamStatus } from '../emails/entities/email.entity';

@Controller('incoming-review')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GlobalRole.SUPER_USER)
export class IncomingReviewController {
  constructor(
    private readonly incomingReviewService: IncomingReviewService,
  ) {}

  @Get()
  getUnassignedEmails(
    @Query('spamStatus') spamStatus?: EmailSpamStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    return this.incomingReviewService.getUnassignedEmails({
      spamStatus,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      search,
    });
  }

  @Patch(':id/assign-project')
  assignToProject(
    @Param('id') id: string,
    @Body('projectId') projectId?: string | null,
  ) {
    // Handle empty string, null, or undefined as unassignment
    const finalProjectId = projectId === '' || projectId === null || projectId === undefined ? '' : projectId;
    return this.incomingReviewService.assignToProject(id, finalProjectId);
  }

  @Patch(':id/assign-user')
  assignToUser(@Param('id') id: string, @Body('userId') userId: string) {
    return this.incomingReviewService.assignToUser(id, userId);
  }

  @Patch(':id/spam-status')
  markSpamStatus(
    @Param('id') id: string,
    @Body('spamStatus') spamStatus: EmailSpamStatus,
  ) {
    return this.incomingReviewService.markSpamStatus(id, spamStatus);
  }

  @Patch('bulk/assign-project')
  bulkAssignToProject(
    @Body('emailIds') emailIds: string[],
    @Body('projectId') projectId: string,
  ) {
    return this.incomingReviewService.bulkAssignToProject(emailIds, projectId);
  }

  @Patch(':id/process-ai')
  processEmailWithAI(@Param('id') id: string) {
    return this.incomingReviewService.processEmailWithAI(id);
  }

  @Patch('bulk/process-ai')
  processEmailsWithAI(@Body('emailIds') emailIds: string[]) {
    return this.incomingReviewService.processEmailsWithAI(emailIds);
  }

  @Post('process-all-unprocessed')
  processAllUnprocessedEmails() {
    return this.incomingReviewService.processAllUnprocessedEmails();
  }
}

