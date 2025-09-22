import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PostModule } from 'src/post/post.module';
import { UserModule } from 'src/user/user.module';
import { PostTagModule } from 'src/post-tag/post-tag.module';
import { TagModule } from 'src/tag/tag.module';

@Module({
  controllers: [SearchController],
  imports: [PostModule, UserModule, PostTagModule, TagModule],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
