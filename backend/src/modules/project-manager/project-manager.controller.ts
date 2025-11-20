import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectManagerService } from './project-manager.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('project-manager')
@UseGuards(JwtAuthGuard)
export class ProjectManagerController {
  constructor(private readonly projectManagerService: ProjectManagerService) {}

  @Get('projects')
  async getManagedProjects(@Request() req: { user: { id: string } }) {
    return this.projectManagerService.getManagedProjects(req.user.id);
  }

  @Get('emails')
  async getProjectEmails(
    @Request() req: { user: { id: string } },
    @Query('projectId') projectId?: string,
  ) {
    return this.projectManagerService.getProjectEmails(req.user.id, projectId);
  }

  @Get('projects/:projectId/emails/unassigned')
  async getUnassignedEmails(
    @Request() req: { user: { id: string } },
    @Param('projectId') projectId: string,
  ) {
    return this.projectManagerService.getUnassignedProjectEmails(
      req.user.id,
      projectId,
    );
  }

  @Get('projects/:projectId/emails/assigned')
  async getAssignedEmails(
    @Request() req: { user: { id: string } },
    @Param('projectId') projectId: string,
  ) {
    return this.projectManagerService.getAssignedProjectEmails(
      req.user.id,
      projectId,
    );
  }

  @Get('projects/:projectId/users')
  async getProjectUsers(
    @Request() req: { user: { id: string } },
    @Param('projectId') projectId: string,
  ) {
    return this.projectManagerService.getProjectUsers(projectId, req.user.id);
  }

  @Get('projects/:projectId/roles/:roleId/users')
  async getUsersByRole(
    @Request() req: { user: { id: string } },
    @Param('projectId') projectId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.projectManagerService.getUsersByRole(
      projectId,
      roleId,
      req.user.id,
    );
  }

  @Get('emails/:emailId/assignments')
  async getEmailAssignments(
    @Request() req: { user: { id: string } },
    @Param('emailId') emailId: string,
  ) {
    return this.projectManagerService.getEmailAssignments(emailId, req.user.id);
  }

  @Get('projects/:projectId/is-manager')
  async isProjectManager(
    @Request() req: { user: { id: string } },
    @Param('projectId') projectId: string,
  ) {
    const isPM = await this.projectManagerService.isProjectManager(
      req.user.id,
      projectId,
    );
    return { isProjectManager: isPM };
  }
}
