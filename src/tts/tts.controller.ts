import { Controller, Post } from '@nestjs/common';
import { TtsService } from './tts.service';
import generateSafeSSML from 'src/shared/utils/generateSafeSSML';

@Controller({ path: 'tts', version: '1' })
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post()
  createAudio() {
    return this.ttsService.synthesizeTextToFile(
      generateSafeSSML('Xin chào mọi người, tôi là khoa múp!'),
      '',
    );
  }
}
