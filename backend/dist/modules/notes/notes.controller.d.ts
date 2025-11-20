import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
export declare class NotesController {
    private readonly notesService;
    constructor(notesService: NotesService);
    create(createNoteDto: CreateNoteDto, req: any): Promise<import("./entities/note.entity").Note>;
    findAll(emailId: string): Promise<import("./entities/note.entity").Note[]>;
    findOne(id: string): Promise<import("./entities/note.entity").Note>;
    update(id: string, updateNoteDto: UpdateNoteDto): Promise<import("./entities/note.entity").Note>;
    remove(id: string): Promise<void>;
}
