import { Email } from '../../emails/entities/email.entity';
import { User } from '../../users/entities/user.entity';
export declare class Note {
    id: string;
    content: string;
    emailId: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    email: Email;
    author: User;
}
