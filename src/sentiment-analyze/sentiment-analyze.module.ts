import { Module } from '@nestjs/common';
import { CommentSentimentService } from './sentiment-analyze.service';

@Module({
  providers: [CommentSentimentService],
  exports: [CommentSentimentModule, CommentSentimentService],
})
export class CommentSentimentModule {}
