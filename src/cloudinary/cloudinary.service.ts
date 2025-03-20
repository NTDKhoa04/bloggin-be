import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>(async (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload result is undefined'));
          }
        },
      );
      try {
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      } catch (error) {
        reject(error);
        console.error(error);
      }
    });
  }
}
