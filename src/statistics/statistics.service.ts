import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  GetTopFollowedUserResponseDto,
  GetTopFollowedUserResponseSchema,
} from './dto/get-top-followed-user-response.dto';
import { GetTopTopicResponseSchema } from './dto/get-top-topic-response';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
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
}
