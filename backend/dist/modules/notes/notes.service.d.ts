import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
export declare class NotesService {
    private notesRepository;
    private notificationsService;
    private usersService;
    constructor(notesRepository: Repository<Note>, notificationsService: NotificationsService, usersService: UsersService);
    create(createNoteDto: CreateNoteDto, authorId: string): Promise<Note>;
    findAll(emailId: string): Promise<Note[]>;
    findOne(id: string): Promise<Note>;
    update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note>;
    remove(id: string): Promise<void>;
    extractMentions(content: string): string[];
}
