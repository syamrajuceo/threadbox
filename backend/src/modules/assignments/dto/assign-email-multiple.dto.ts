import { IsArray, IsUUID } from 'class-validator';

export class AssignEmailMultipleDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  userIds: string[];
}

