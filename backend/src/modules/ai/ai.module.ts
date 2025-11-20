import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpamClassifierService } from './services/spam-classifier.service';
import { ProjectClassifierService } from './services/project-classifier.service';
import { ClaudeProvider } from './providers/claude.provider';
import { AIController } from './ai.controller';
import { Project } from '../projects/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [AIController],
  providers: [ClaudeProvider, SpamClassifierService, ProjectClassifierService],
  exports: [ClaudeProvider, SpamClassifierService, ProjectClassifierService],
})
export class AIModule {}
