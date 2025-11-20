import { IsString, MinLength } from 'class-validator';

export class ResetEmailsDto {
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}

