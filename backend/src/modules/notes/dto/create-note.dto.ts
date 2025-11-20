import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @MinLength(1)
  content: string;

  @IsUUID()
  emailId: string;
}
