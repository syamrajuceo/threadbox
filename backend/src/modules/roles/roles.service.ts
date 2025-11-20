import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
      type: createRoleDto.type,
      projectId: createRoleDto.projectId,
    });

    const savedRole = await this.rolesRepository.save(role);

    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      const permissions = createRoleDto.permissions.map((permissionType) =>
        this.permissionsRepository.create({
          type: permissionType,
          roleId: savedRole.id,
        }),
      );
      await this.permissionsRepository.save(permissions);
    }

    return this.findOne(savedRole.id);
  }

  async findAll(projectId?: string): Promise<Role[]> {
    const where = projectId ? { projectId } : {};
    return this.rolesRepository.find({
      where,
      relations: ['permissions'],
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    Object.assign(role, updateRoleDto);

    if (updateRoleDto.permissions) {
      await this.permissionsRepository.delete({ roleId: id });
      const permissions = updateRoleDto.permissions.map((permissionType) =>
        this.permissionsRepository.create({
          type: permissionType,
          roleId: id,
        }),
      );
      await this.permissionsRepository.save(permissions);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepository.remove(role);
  }
}

