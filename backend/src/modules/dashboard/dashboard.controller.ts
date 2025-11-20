import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(
    @Request() req: { user: { id: string; globalRole: string } },
  ) {
    const user = req.user;
    const isSuperUser = user.globalRole === 'super_user';
    return this.dashboardService.getUserProjects(user.id, isSuperUser);
  }
}
