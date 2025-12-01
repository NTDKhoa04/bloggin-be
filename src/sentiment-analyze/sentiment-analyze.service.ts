import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

import { Injectable } from '@nestjs/common';

@Injectable()
export class SentimentAnalyzeService {
  async analyzeSentiment(comment: string): Promise<boolean> {
    const moderation = await openai.moderations.create({
      model: 'omni-moderation-latest',
      input: comment,
    });

    if (moderation.results[0].flagged) {
      return false;
    } else {
      return true;
    }
  }
}
