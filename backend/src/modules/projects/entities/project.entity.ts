import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Membership } from '../../memberships/entities/membership.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  clientName: string;

  @Column('text', { array: true, default: [] })
  domains: string[];

  @Column('text', { array: true, default: [] })
  keywords: string[];

  @Column('text', { array: true, default: [] })
  knownAddresses: string[];

  @Column({ default: false })
  archived: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Membership, (membership) => membership.project)
  memberships: Membership[];
}

