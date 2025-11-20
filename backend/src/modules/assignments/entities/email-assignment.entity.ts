import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Email } from '../../emails/entities/email.entity';
import { User } from '../../users/entities/user.entity';

@Entity('email_assignments')
export class EmailAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  emailId: string;

  @Column({ type: 'uuid' })
  assignedToId: string;

  @Column({ type: 'uuid' })
  assignedById: string; // User who made the assignment

  @CreateDateColumn()
  assignedAt: Date;

  @ManyToOne(() => Email, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emailId' })
  email: Email;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignedById' })
  assignedBy: User;
}

