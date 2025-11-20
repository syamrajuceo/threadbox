import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Permission } from './permission.entity';
import { Membership } from '../../memberships/entities/membership.entity';

export enum ProjectRoleType {
  PROJECT_MANAGER = 'project_manager',
  DEVELOPER = 'developer',
  TESTER = 'tester',
  CUSTOM = 'custom',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectRoleType,
  })
  type: ProjectRoleType;

  @Column()
  projectId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Permission, (permission) => permission.role, {
    cascade: true,
  })
  permissions: Permission[];

  @OneToMany(() => Membership, (membership) => membership.role)
  memberships: Membership[];
}

