import * as textToSpeech from '@google-cloud/text-to-speech';
import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class TtsService {
  private client: textToSpeech.v1beta1.TextToSpeechClient;

  constructor(private readonly cloudinaryService: CloudinaryService) {
    this.client = new textToSpeech.v1beta1.TextToSpeechClient();
  }

  async synthesizeTextToFile(text: string, language: string) {
    console.log(text);

    const request: textToSpeech.protos.google.cloud.texttospeech.v1beta1.ISynthesizeSpeechRequest =
      {
        input: { ssml: text },
        voice: {
          languageCode: language === 'en' ? 'en-US' : 'vi-VN',
          ssmlGender: 'NEUTRAL',
        },
        audioConfig: {
          audioEncoding: 'MP3',
        },
        enableTimePointing: [
          textToSpeech.protos.google.cloud.texttospeech.v1beta1
            .SynthesizeSpeechRequest.TimepointType.SSML_MARK,
        ],
      };

    const [response] = await this.client.synthesizeSpeech(request);

    console.log(response.timepoints);

    const audioBuffer = response.audioContent as Buffer;
    const cloudinaryResult =
      await this.cloudinaryService.uploadAudio(audioBuffer);

    return cloudinaryResult.secure_url;
  }
}
