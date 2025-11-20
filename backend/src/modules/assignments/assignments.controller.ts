import {
  Controller,
  Patch,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignEmailDto } from './dto/assign-email.dto';
import { AssignEmailMultipleDto } from './dto/assign-email-multiple.dto';
import { UpdateEmailStatusDto } from './dto/update-email-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Patch('email/:id/assign')
  assignEmail(@Param('id') id: string, @Body() dto: AssignEmailDto, @Request() req: { user: { firstName: string; lastName: string } }) {
    const assignedBy = `${req.user.firstName} ${req.user.lastName}`;
    if (dto.userId) {
      return this.assignmentsService.assignToUser(id, dto.userId, assignedBy);
    } else if (dto.roleId) {
      return this.assignmentsService.assignToRole(id, dto.roleId);
    }
    throw new Error('Either userId or roleId must be provided');
  }

  @Post('email/:id/assign-multiple')
  assignEmailToMultiple(
    @Param('id') id: string,
    @Body() dto: AssignEmailMultipleDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.assignmentsService.assignToMultipleUsers(
      id,
      dto.userIds,
      req.user.id,
    );
  }

  @Get('email/:id/assignments')
  getEmailAssignments(@Param('id') id: string): Promise<EmailAssignment[]> {
    return this.assignmentsService.getEmailAssignments(id);
  }

  @Patch('email/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEmailStatusDto,
  ) {
    return this.assignmentsService.updateStatus(id, dto.status);
  }
}

