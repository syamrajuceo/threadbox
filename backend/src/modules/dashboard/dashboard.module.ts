import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Project } from '../projects/entities/project.entity';
import { Membership } from '../memberships/entities/membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Membership])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
