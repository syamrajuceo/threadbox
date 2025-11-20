import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Email } from './email.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  contentType: string;

  @Column()
  size: number;

  @Column()
  filePath: string; // Path to stored file

  @Column({ nullable: true })
  emailId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Email, (email) => email.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emailId' })
  email: Email;
}

