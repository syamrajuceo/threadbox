import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from './entities/membership.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private membershipsRepository: Repository<Membership>,
  ) {}

  async create(createMembershipDto: CreateMembershipDto): Promise<Membership> {
    const membership = this.membershipsRepository.create(createMembershipDto);
    return this.membershipsRepository.save(membership);
  }

  async findAll(projectId?: string, userId?: string): Promise<Membership[]> {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;

    return this.membershipsRepository.find({
      where,
      relations: ['user', 'project', 'role', 'role.permissions'],
    });
  }

  async findOne(id: string): Promise<Membership> {
    const membership = await this.membershipsRepository.findOne({
      where: { id },
      relations: ['user', 'project', 'role', 'role.permissions'],
    });
    if (!membership) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }
    return membership;
  }

  async remove(id: string): Promise<void> {
    const membership = await this.findOne(id);
    await this.membershipsRepository.remove(membership);
  }
}
