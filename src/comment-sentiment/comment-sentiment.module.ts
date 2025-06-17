import { Module } from '@nestjs/common';
import { CommentSentimentService } from './comment-sentiment.service';

@Module({
  providers: [CommentSentimentService],
  exports: [CommentSentimentModule, CommentSentimentService],
})
export class CommentSentimentModule {}
