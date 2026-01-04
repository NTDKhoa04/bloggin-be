import { IsNotEmpty, IsString } from 'class-validator';

export class SaveYjsContentDto {
  @IsNotEmpty()
  @IsString()
  content: string; // Base64 encoded Yjs document state
}
