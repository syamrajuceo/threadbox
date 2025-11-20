import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { UserEmailsService } from './services/user-emails.service';
import { Email } from './entities/email.entity';
import { Attachment } from './entities/attachment.entity';
import { EmailThread } from './entities/email-thread.entity';
import { EmailAssignment } from '../assignments/entities/email-assignment.entity';
import { Note } from '../notes/entities/note.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Email,
      Attachment,
      EmailThread,
      EmailAssignment,
      Note,
      Membership,
    ]),
    UsersModule,
    AuthModule,
  ],
  controllers: [EmailsController],
  providers: [EmailsService, UserEmailsService],
  exports: [EmailsService, UserEmailsService],
})
export class EmailsModule {}

