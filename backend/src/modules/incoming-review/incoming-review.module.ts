import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomingReviewController } from './incoming-review.controller';
import { IncomingReviewService } from './incoming-review.service';
import { Email } from '../emails/entities/email.entity';
import { EmailsModule } from '../emails/emails.module';
import { EmailIngestionModule } from '../email-ingestion/email-ingestion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Email]),
    EmailsModule,
    EmailIngestionModule,
  ],
  controllers: [IncomingReviewController],
  providers: [IncomingReviewService],
  exports: [IncomingReviewService],
})
export class IncomingReviewModule {}

