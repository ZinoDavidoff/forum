import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateThreadDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
