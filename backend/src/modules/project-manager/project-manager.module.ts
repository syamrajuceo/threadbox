import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectManagerService } from './project-manager.service';
import { ProjectManagerController } from './project-manager.controller';
import { Membership } from '../memberships/entities/membership.entity';
import { Email } from '../emails/entities/email.entity';
import { User } from '../users/entities/user.entity';
import { EmailAssignment } from '../assignments/entities/email-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Membership,
      Email,
      User,
      EmailAssignment,
    ]),
  ],
  controllers: [ProjectManagerController],
  providers: [ProjectManagerService],
  exports: [ProjectManagerService],
})
export class ProjectManagerModule {}

