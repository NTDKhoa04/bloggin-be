import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { LoggedInOnly } from 'src/auth/guards/authenticated.guard';

@Controller({ path: 'cloudinary', version: '1' })
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @UseGuards(LoggedInOnly)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadFile(file);
  }
}
