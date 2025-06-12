import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  GetTopFollowedUserResponseDto,
  GetTopFollowedUserResponseSchema,
} from './dto/get-top-followed-user-response.dto';
import { GetTopTopicResponseSchema } from './dto/get-top-topic-response';
import { User } from 'src/user/model/user.model';
import { Tag } from 'src/tag/model/tag.model';
import { Follow } from 'src/follow/model/follow.model';
import { Favorite } from 'src/favorite/model/favorite.model';
import { Post } from 'src/post/model/post.model';
import { Comment } from 'src/comment/model/comment.model';
import {
  GetMonthlyStatisticsResponseDto,
  GetMonthlyStatisticsResponseSchema,
} from './dto/get-monthly-statistics-response.dto';
import {
  GetTagDistributionResponseDto,
  GetTagDistributionResponseSchema,
} from './dto/get-tag-distribution-response.dto';
import {
  GetTopInteractivePostDto,
  GetTopInteractivePostSchema,
} from './dto/get-top-interactive-post.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Post)
    private postModel: typeof Post,
    @InjectModel(Tag)
    private tagModel: typeof Tag,
    @InjectModel(Follow)
    private followModel: typeof Follow,
    @InjectModel(Favorite)
    private favoriteModel: typeof Favorite,
    @InjectModel(Comment)
    private commentModel: typeof Comment,
  ) {}

  async getTopFollowedUser(
    top?: number,
  ): Promise<GetTopFollowedUserResponseDto[]> {
    const results = (
      await this.sequelize.query(
        `select "Users"."id",
        "Users"."username",
        "Users"."displayName",
        "Users"."avatarUrl", 
        "Users"."specialties",
        CAST(COUNT("Follows"."followerId") AS INT) AS "followedCount"
        from "Users" full outer join "Follows" on "id" = "authorId"
        group by "Users"."id"
        order by "followedCount" desc
        ${top ? `limit ${top}` : ''}`,
      )
    )[0];
    const parsedResult = results.map((user) => {
      const result = GetTopFollowedUserResponseSchema.safeParse(user);
      if (!result.success) {
        throw new InternalServerErrorException(
          'Failed to parse the result from the database',
        );
      }
      return result.data;
    });
    return parsedResult;
  }

  async getTopTag(top?: number) {
    const results = (
      await this.sequelize.query(
        `select "Tags"."id","Tags"."name", cast(count("postId") as int) as "postCount"
          from "Tags" full outer join "Post_Tags" on "Post_Tags"."tagId" = "Tags".id
          group by "Tags"."id"
          order by "postCount" desc
        ${top ? `limit ${top}` : ''};`,
      )
    )[0];
    const parsedResult = results.map((topic) => {
      const result = GetTopTopicResponseSchema.safeParse(topic);
      if (!result.success) {
        throw new InternalServerErrorException(
          'Failed to parse the result from the database',
        );
      }
      return result.data;
    });
    return parsedResult;
  }

  async getAdminOverallStats() {
    const [
      usersCount,
      postsCount,
      tagsCount,
      followsCount,
      favoritesCount,
      commentsCount,
    ] = await Promise.all([
      this.userModel.count(),
      this.postModel.count(),
      this.tagModel.count(),
      this.followModel.count(),
      this.favoriteModel.count(),
      this.commentModel.count(),
    ]);

    const interactionCount = followsCount + favoritesCount + commentsCount;

    return {
      usersCount,
      postsCount,
      tagsCount,
      followsCount,
      favoritesCount,
      commentsCount,
      interactionCount,
    };
  }

  async getMonthlyUserResgistration(): Promise<
    GetMonthlyStatisticsResponseDto[]
  > {
    const results = (
      await this.sequelize.query(
        `SELECT 
        DATE_TRUNC('day', "createdAt") AS "date", 
        CAST(COUNT(*) AS INT) AS "count"
      FROM "Users"
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY "date" ASC;`,
      )
    )[0];

    // Validate the results against the schema
    const parsedResult = results.map((result) => {
      const res = GetMonthlyStatisticsResponseSchema.safeParse(result);
      if (!res.success) {
        console.log(res.error);
        throw new InternalServerErrorException(
          'Failed to parse the result from the database',
        );
      } else {
        return res.data;
      }
    });

    const formatedResult = formatResponse(parsedResult);
    return formatedResult;
  }

  async getMonthlyPostUpload(): Promise<GetMonthlyStatisticsResponseDto[]> {
    const results = (
      await this.sequelize.query(
        `SELECT 
        DATE_TRUNC('day', "createdAt") AS "date", 
        CAST(COUNT(*) AS INT) AS "count"
      FROM "Posts"
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY "date" ASC;`,
      )
    )[0];

    // Validate the results against the schema
    const parsedResult = results.map((result) => {
      const res = GetMonthlyStatisticsResponseSchema.safeParse(result);
      if (!res.success) {
        console.log(res.error);
        throw new InternalServerErrorException(
          'Failed to parse the result from the database',
        );
      } else {
        return res.data;
      }
    });

    const formatedResult = formatResponse(parsedResult);
    return formatedResult;
  }

  async getTagDistribution(): Promise<GetTagDistributionResponseDto[]> {
    const results = (
      await this.sequelize.query(
        `SELECT "Tags"."name", CAST(COUNT(*) AS INT) AS "count"
        FROM "Post_Tags" JOIN "Tags"
        ON "Post_Tags"."tagId" = "Tags"."id"
        GROUP BY "Tags"."name"
        order by "count" DESC;`,
      )
    )[0];

    const parsedResult = results.map((result) => {
      const res = GetTagDistributionResponseSchema.safeParse(result);
      if (!res.success) {
        console.log(res.error);
        throw new InternalServerErrorException(
          'Failed to parse the result from the database',
        );
      } else {
        return res.data;
      }
    });

    let formatedResult = parsedResult.slice(0, parsedResult.length / 2); // Limit to top 10 tags
    const otherTags = parsedResult.slice(parsedResult.length / 2);
    const reducedCount = otherTags.reduce((acc, tag) => acc + tag.count, 0);
    formatedResult.push({
      name: 'others',
      count: reducedCount,
    });

    return formatedResult;
  }

  async getTopInteractivePost(): Promise<GetTopInteractivePostDto[]> {
    const results = (
      await this.sequelize.query(
        `SELECT p.title, 
                CAST(COUNT(DISTINCT c.id) AS INT) AS "commentCount", 
                CAST(COUNT(DISTINCT f."followerId") AS INT) AS "favoriteCount"
          FROM "Posts" p
                inner JOIN "Comments" c ON c."postId" = p.id
                inner JOIN "Favorites" f ON f."postId" = p.id
          GROUP BY  p.title
          ORDER BY p.title
          LIMIT 5;`,
      )
    )[0];

    const parsedResult = results.map((result) => {
      const res = GetTopInteractivePostSchema.safeParse(result);
      if (!res.success) {
        console.log(res.error);
        throw new InternalServerErrorException(
          'Failed to parse the result from the database',
        );
      } else {
        return res.data;
      }
    });

    return parsedResult;
  }
}

function getDaysInThisMonth(): number {
  const date = new Date(1);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function formatResponse(parsedResult: GetMonthlyStatisticsResponseDto[]) {
  const dateCountMap = new Map(
    parsedResult.map((item) => [
      new Date(item.date).toISOString().slice(0, 10), // 'YYYY-MM-DD'
      item.count,
    ]),
  );

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const daysInMonth = getDaysInThisMonth();

  // Build the array for each day of this month
  const dailyCounts = Array.from({ length: daysInMonth }).map((_, i) => {
    const date = new Date(year, month, i + 1);
    const dateStr = date.toISOString().slice(0, 10);
    return {
      date: date,
      count: dateCountMap.get(dateStr) || 0,
    };
  });

  return dailyCounts;
}
