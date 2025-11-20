import { IsUUID, IsString, MinLength } from 'class-validator';

export class CreateEscalationDto {
  @IsUUID()
  emailId: string;

  @IsString()
  @MinLength(10)
  message: string;
}
