import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { RolesModule } from './modules/roles/roles.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EmailsModule } from './modules/emails/emails.module';
import { EmailIngestionModule } from './modules/email-ingestion/email-ingestion.module';
import { AIModule } from './modules/ai/ai.module';
import { IncomingReviewModule } from './modules/incoming-review/incoming-review.module';
import { NotesModule } from './modules/notes/notes.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { EscalationsModule } from './modules/escalations/escalations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProjectManagerModule } from './modules/project-manager/project-manager.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
      // Use lazy connection - don't block app startup
      // Connection will be established when first query is made
    }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    RolesModule,
    MembershipsModule,
    DashboardModule,
    EmailsModule,
    EmailIngestionModule,
    AIModule,
    IncomingReviewModule,
    NotesModule,
    AssignmentsModule,
    EscalationsModule,
    NotificationsModule,
    ProjectManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
