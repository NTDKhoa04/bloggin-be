import { Injectable } from '@nestjs/common';
import { PostTagService } from 'src/post-tag/post-tag.service';
import { PostService } from 'src/post/post.service';
import { TagService } from 'src/tag/tag.service';
import { UserService } from 'src/user/user.service';
import { SearchResponseDto } from './dtos/search-response.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
    private readonly postTagService: PostTagService,
    private readonly tagService: TagService,
  ) {}

  async searchAsync(query: string) {
    var posts = await this.postService.getPostByTitleAsync(query);

    var authors = await this.userService.getUsersByNameAsync(query);

    var { data: tags } = await this.tagService.findAll(
      { page: 1, limit: 50 },
      query,
    );

    //Post related results
    var postIds = posts.map((post) => post.id);
    var postsAuthorIds = posts.map((post) => post.authorId);

    var postRelatedTags =
      await this.postTagService.findAllTagsByPostIds(postIds);

    postRelatedTags = postRelatedTags.filter((tag) => {
      return tags && !tags.find((t) => t.id === tag.id);
    });

    var postRelatedAuthors =
      await this.userService.findUserByIds(postsAuthorIds);

    postRelatedAuthors = postRelatedAuthors.filter((author) => {
      return !authors.find((a) => a.id === author.id);
    });

    //Author related results
    var authorIds = authors.map((author) => author.id);

    var authorRelatedPosts =
      await this.postService.getPostByAuthorIdsAsync(authorIds);

    authorRelatedPosts = authorRelatedPosts.filter((post) => {
      return !posts.find((p) => p.id === post.id);
    });

    //Tag related results
    var tagIds = tags ? tags.map((tag) => tag.id) : [];
    var tagRelatedPosts =
      await this.postTagService.findAllPostsByTagIds(tagIds);

    tagRelatedPosts = tagRelatedPosts.filter((post) => {
      return !posts.find((p) => p.id === post.id);
    });

    //Concating the results
    authors = authors ? authors.concat(postRelatedAuthors) : authors;
    tags = tags ? tags.concat(postRelatedTags) : tags;
    posts = posts
      ? posts.concat(authorRelatedPosts).concat(tagRelatedPosts)
      : posts;

    const result: SearchResponseDto = {
      Posts: posts.sort((a, b) =>
        a.monitoringStatus.localeCompare(b.monitoringStatus),
      ),
      Authors: authors,
      Tags: tags,
    };

    return result;
  }
}
