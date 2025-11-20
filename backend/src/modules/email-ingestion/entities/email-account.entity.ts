import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EmailProvider {
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
  IMAP = 'imap',
}

@Entity('email_accounts')
export class EmailAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // User-friendly name for the account

  @Column({
    type: 'enum',
    enum: EmailProvider,
  })
  provider: EmailProvider;

  @Column()
  account: string; // Email address

  @Column('text')
  credentials: string; // Encrypted JSON string of credentials

  @Column({ nullable: true })
  redirectUri: string; // For OAuth providers

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastIngestedAt: Date | null;

  @Column({ type: 'integer', nullable: true })
  lastIngestedCount: number | null;

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
