import { Controller, Post } from '@nestjs/common';
import { TtsService } from './tts.service';

@Controller({ path: 'tts', version: '1' })
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post()
  createAudio() {
    return this.ttsService.synthesizeTextToFile(
      'Xin chào mọi người, tôi là khoa múp!',
      'english',
    );
  }
}
