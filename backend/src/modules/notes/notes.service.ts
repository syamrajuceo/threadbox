import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
  ) {}

  async create(createNoteDto: CreateNoteDto, authorId: string): Promise<Note> {
    const note = this.notesRepository.create({
      ...createNoteDto,
      authorId,
    });
    const savedNote = await this.notesRepository.save(note);

    // Extract mentions and send notifications
    const mentions = this.extractMentions(createNoteDto.content);
    const author = await this.usersService.findOne(authorId);
    const authorName = `${author.firstName} ${author.lastName}`;

    // Get email to find project
    const email = await this.notesRepository.manager
      .getRepository('emails')
      .findOne({ where: { id: createNoteDto.emailId } });

    for (const mention of mentions) {
      // Find user by email or username (simplified - you may want to improve this)
      try {
        const mentionedUser = await this.usersService.findByEmail(mention);
        if (mentionedUser && mentionedUser.id !== authorId) {
          await this.notificationsService.notifyMention(
            mentionedUser.id,
            createNoteDto.emailId,
            String((email as { projectId?: string })?.projectId || ''),
            authorName,
          );
        }
      } catch (error) {
        // User not found, skip
      }
    }

    return savedNote;
  }

  async findAll(emailId: string): Promise<Note[]> {
    return this.notesRepository.find({
      where: { emailId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id },
      relations: ['author', 'email'],
    });
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(id);
    Object.assign(note, updateNoteDto);
    return this.notesRepository.save(note);
  }

  async remove(id: string): Promise<void> {
    const note = await this.findOne(id);
    await this.notesRepository.remove(note);
  }

  extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return [...new Set(mentions)]; // Remove duplicates
  }
}
