import { IsString, IsOptional, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  birthDate?: Date;

  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;
}
