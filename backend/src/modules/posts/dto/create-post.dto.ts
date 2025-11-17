import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  threadId: string;

  @IsString()
  @IsOptional()
  parentPostId?: string;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}
