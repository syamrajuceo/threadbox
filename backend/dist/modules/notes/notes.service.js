"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const note_entity_1 = require("./entities/note.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const users_service_1 = require("../users/users.service");
let NotesService = class NotesService {
    notesRepository;
    notificationsService;
    usersService;
    constructor(notesRepository, notificationsService, usersService) {
        this.notesRepository = notesRepository;
        this.notificationsService = notificationsService;
        this.usersService = usersService;
    }
    async create(createNoteDto, authorId) {
        const note = this.notesRepository.create({
            ...createNoteDto,
            authorId,
        });
        const savedNote = await this.notesRepository.save(note);
        const mentions = this.extractMentions(createNoteDto.content);
        const author = await this.usersService.findOne(authorId);
        const authorName = `${author.firstName} ${author.lastName}`;
        const email = await this.notesRepository.manager
            .getRepository('emails')
            .findOne({ where: { id: createNoteDto.emailId } });
        for (const mention of mentions) {
            try {
                const mentionedUser = await this.usersService.findByEmail(mention);
                if (mentionedUser && mentionedUser.id !== authorId) {
                    await this.notificationsService.notifyMention(mentionedUser.id, createNoteDto.emailId, String(email?.projectId || ''), authorName);
                }
            }
            catch (error) {
            }
        }
        return savedNote;
    }
    async findAll(emailId) {
        return this.notesRepository.find({
            where: { emailId },
            relations: ['author'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const note = await this.notesRepository.findOne({
            where: { id },
            relations: ['author', 'email'],
        });
        if (!note) {
            throw new common_1.NotFoundException(`Note with ID ${id} not found`);
        }
        return note;
    }
    async update(id, updateNoteDto) {
        const note = await this.findOne(id);
        Object.assign(note, updateNoteDto);
        return this.notesRepository.save(note);
    }
    async remove(id) {
        const note = await this.findOne(id);
        await this.notesRepository.remove(note);
    }
    extractMentions(content) {
        const mentionRegex = /@(\w+)/g;
        const mentions = [];
        let match;
        while ((match = mentionRegex.exec(content)) !== null) {
            mentions.push(match[1]);
        }
        return [...new Set(mentions)];
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(note_entity_1.Note)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        users_service_1.UsersService])
], NotesService);
//# sourceMappingURL=notes.service.js.map