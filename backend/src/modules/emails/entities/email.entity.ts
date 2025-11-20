import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { Attachment } from './attachment.entity';
import { EmailThread } from './email-thread.entity';

export enum EmailStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING = 'waiting',
  CLOSED = 'closed',
}

export enum EmailSpamStatus {
  NOT_SPAM = 'not_spam',
  SPAM = 'spam',
  POSSIBLE_SPAM = 'possible_spam',
}

@Entity('emails')
export class Email {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subject: string;

  @Column('text')
  body: string;

  @Column('text', { nullable: true })
  bodyHtml: string;

  @Column()
  fromAddress: string;

  @Column()
  fromName: string;

  @Column('text', { array: true, default: [] })
  toAddresses: string[];

  @Column('text', { array: true, default: [] })
  ccAddresses: string[];

  @Column('text', { array: true, default: [] })
  bccAddresses: string[];

  @Column({ type: 'timestamp' })
  receivedAt: Date;

  @Column({ nullable: true })
  messageId: string;

  @Column({ nullable: true })
  inReplyTo: string;

  @Column({ nullable: true })
  references: string;

  @Column({
    type: 'enum',
    enum: EmailStatus,
    default: EmailStatus.OPEN,
  })
  status: EmailStatus;

  @Column({
    type: 'enum',
    enum: EmailSpamStatus,
    default: EmailSpamStatus.POSSIBLE_SPAM,
  })
  spamStatus: EmailSpamStatus;

  @Column({ type: 'float', nullable: true })
  spamConfidence: number;

  @Column({ type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ type: 'uuid', nullable: true })
  assignedToId: string | null;

  @Column({ type: 'uuid', nullable: true })
  assignedToRoleId: string | null;

  @Column({ type: 'uuid', nullable: true })
  aiSuggestedProjectId: string | null;

  @Column({ type: 'float', nullable: true })
  aiProjectConfidence: number;

  @Column({ default: false })
  isUnassigned: boolean;

  @Column({ nullable: true })
  provider: string; // 'gmail', 'outlook', 'imap'

  @Column({ nullable: true })
  providerEmailId: string; // External email ID from provider

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @OneToMany(() => Attachment, (attachment) => attachment.email, {
    cascade: true,
  })
  attachments: Attachment[];

  @ManyToOne(() => EmailThread, (thread) => thread.emails, { nullable: true })
  @JoinColumn({ name: 'threadId' })
  thread: EmailThread;

  @Column({ type: 'uuid', nullable: true })
  threadId: string | null;
}

