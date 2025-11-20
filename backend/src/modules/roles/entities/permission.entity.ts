import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';

export enum PermissionType {
  VIEW_SCOPE = 'view_scope',
  ASSIGNMENT = 'assignment',
  MEMBER_MANAGEMENT = 'member_management',
  EMAIL_SENDING = 'email_sending',
  STATUS_CHANGE = 'status_change',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PermissionType,
  })
  type: PermissionType;

  @Column()
  roleId: string;

  @ManyToOne(() => Role, (role) => role.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Role;
}

