import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailIngestionService } from './email-ingestion.service';
import { EmailIngestionController } from './email-ingestion.controller';
import { EmailIngestionScheduler } from './email-ingestion.scheduler';
import { EmailProcessorService } from './processors/email-processor.service';
import { EmailAccountsService } from './services/email-accounts.service';
import { EmailAccountsController } from './controllers/email-accounts.controller';
import { Email } from '../emails/entities/email.entity';
import { Attachment } from '../emails/entities/attachment.entity';
import { EmailThread } from '../emails/entities/email-thread.entity';
import { EmailAccount } from './entities/email-account.entity';
import { Project } from '../projects/entities/project.entity';
import { EmailsModule } from '../emails/emails.module';
import { AIModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Email, Attachment, EmailThread, EmailAccount, Project]),
    EmailsModule,
    AIModule,
    UsersModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [EmailIngestionController, EmailAccountsController],
  providers: [
    EmailIngestionService,
    EmailProcessorService,
    EmailIngestionScheduler,
    EmailAccountsService,
  ],
  exports: [EmailIngestionService, EmailProcessorService, EmailAccountsService],
})
export class EmailIngestionModule {}

