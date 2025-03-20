import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { RemoveFollowDto } from './dto/remove-follow.dto';
import { Follow } from './model/follow.model';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/user/model/user.model';
import {
  PaginationWrapper,
  SuccessResponse,
} from 'src/shared/classes/success-response.class';
import { PaginationDto } from 'src/shared/classes/pagination.dto';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow)
    private followModel: typeof Follow,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async create(createFollowDto: CreateFollowDto, followerId: string) {
    const author = await this.userModel.findByPk(createFollowDto.authorId);
    if (!author) {
      throw new Error('Author not found');
    }

    if (!followerId) {
      throw new Error('Follower not found');
    }

    const followExist = await this.followModel.findOne({
      where: { authorId: createFollowDto.authorId, followerId },
    });

    if (followExist) {
      throw new ConflictException('User already following author');
    }

    const res = await this.followModel.create({
      followerId,
      ...createFollowDto,
    });

    return new SuccessResponse<Follow>('Follow created successfully', res);
  }

  async remove(removeFollowDto: RemoveFollowDto, followerId: string) {
    const { authorId: targetUserId } = removeFollowDto;

    if (!followerId) {
      throw new NotFoundException('Follower not found');
    }

    const author = await this.userModel.findByPk(targetUserId);
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    await this.followModel.destroy({
      where: { authorId: targetUserId, followerId: followerId },
    });

    return new SuccessResponse('Follow removed successfully');
  }

  async getFollowers(userId: string, pagination: PaginationDto) {
    const offset = (pagination.page - 1) * pagination.limit;

    const { rows: followers, count } = await this.followModel.findAndCountAll({
      where: { authorId: userId },
      attributes: ['authorId'],
      include: [
        {
          model: User,
          as: 'follower',
          attributes: ['id', 'displayName', 'avatarUrl'],
        },
      ],
      limit: pagination.limit,
      offset,
    });

    return new PaginationWrapper(
      'Followers retrieved successfully',
      followers,
      count,
      pagination.page,
      pagination.limit,
    );
  }

  async getFollowing(userId: string, pagination: PaginationDto) {
    const offset = (pagination.page - 1) * pagination.limit;

    const { rows: following, count } = await this.followModel.findAndCountAll({
      where: { followerId: userId },
      attributes: ['followerId'],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'displayName', 'avatarUrl'],
        },
      ],
      limit: pagination.limit,
      offset,
    });

    return new PaginationWrapper(
      'Following retrieved successfully',
      following,
      count,
      pagination.page,
      pagination.limit,
    );
  }
}
