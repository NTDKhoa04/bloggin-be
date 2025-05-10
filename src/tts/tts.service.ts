import * as textToSpeech from '@google-cloud/text-to-speech';
import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class TtsService {
  private client: textToSpeech.TextToSpeechClient;

  constructor(private readonly cloudinaryService: CloudinaryService) {
    this.client = new textToSpeech.TextToSpeechClient();
  }

  async synthesizeTextToFile(text: string, language: string) {
    const request: textToSpeech.protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest =
      {
        input: { text },
        voice: {
          languageCode: language === 'english' ? 'en-US' : 'vi-VN',
          ssmlGender: 'NEUTRAL',
        },
        audioConfig: {
          audioEncoding: 'MP3',
        },
      };

    const [response] = await this.client.synthesizeSpeech(request);

    const audioBuffer = response.audioContent as Buffer;
    const cloudinaryResult =
      await this.cloudinaryService.uploadAudio(audioBuffer);

    return cloudinaryResult.secure_url;
  }
}
