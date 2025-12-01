import { Module } from '@nestjs/common';
import { SentimentAnalyzeService } from './sentiment-analyze.service';

@Module({
  providers: [SentimentAnalyzeService],
  exports: [SentimentAnalyzeModule, SentimentAnalyzeService],
})
export class SentimentAnalyzeModule {}
