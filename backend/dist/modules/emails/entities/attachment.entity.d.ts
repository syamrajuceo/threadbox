import { Email } from './email.entity';
export declare class Attachment {
    id: string;
    filename: string;
    contentType: string;
    size: number;
    filePath: string;
    emailId: string;
    createdAt: Date;
    email: Email;
}
