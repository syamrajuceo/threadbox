import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EscalationsService } from './escalations.service';
import { CreateEscalationDto } from './dto/create-escalation.dto';
import { ReviewEscalationDto } from './dto/review-escalation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GlobalRole } from '../users/entities/user.entity';
import { EscalationStatus } from './entities/escalation.entity';

@Controller('escalations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EscalationsController {
  constructor(private readonly escalationsService: EscalationsService) {}

  @Post()
  create(@Body() createEscalationDto: CreateEscalationDto, @Request() req) {
    return this.escalationsService.create(createEscalationDto, req.user.id);
  }

  @Get()
  @Roles(GlobalRole.SUPER_USER)
  findAll(
    @Query('status') status?: EscalationStatus,
    @Query('emailId') emailId?: string,
  ) {
    return this.escalationsService.findAll({ status, emailId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.escalationsService.findOne(id);
  }

  @Patch(':id/review')
  @Roles(GlobalRole.SUPER_USER)
  review(
    @Param('id') id: string,
    @Body() reviewDto: ReviewEscalationDto,
    @Request() req,
  ) {
    return this.escalationsService.review(id, reviewDto, req.user.id);
  }
}

