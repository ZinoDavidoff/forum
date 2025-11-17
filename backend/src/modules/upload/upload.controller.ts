import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
    };
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
    };
  }
}
