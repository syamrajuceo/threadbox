import { IsString, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ProjectRoleType } from '../entities/role.entity';
import { PermissionType } from '../entities/permission.entity';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ProjectRoleType)
  type: ProjectRoleType;

  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsArray()
  @IsEnum(PermissionType, { each: true })
  permissions?: PermissionType[];
}
