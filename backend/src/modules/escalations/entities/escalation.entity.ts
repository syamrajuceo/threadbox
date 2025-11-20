import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Email } from '../../emails/entities/email.entity';
import { User } from '../../users/entities/user.entity';

export enum EscalationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('escalations')
export class Escalation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  emailId: string;

  @Column()
  requestedById: string;

  @Column({ nullable: true })
  reviewedById: string | null;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: EscalationStatus,
    default: EscalationStatus.PENDING,
  })
  status: EscalationStatus;

  @Column('text', { nullable: true })
  reviewNotes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Email, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emailId' })
  email: Email;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requestedById' })
  requestedBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy: User;
}
