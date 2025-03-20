import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { Favorite } from './model/favorite.model';
import { InjectModel } from '@nestjs/sequelize';
import { RemoveFavoriteDto } from './dto/remove-favorite.dto';
import { PaginationDto } from 'src/shared/classes/pagination.dto';
import {
  PaginationWrapper,
  SuccessResponse,
} from 'src/shared/classes/success-response.class';
import { Post } from 'src/post/model/post.model';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favorite) private favoriteModel: typeof Favorite,
    @InjectModel(Post) private postModel: typeof Post,
  ) {}

  async create(createFavoriteDto: CreateFavoriteDto, followerId: string) {
    const post = await this.postModel.findByPk(createFavoriteDto.postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const favoriteExist = await this.favoriteModel.findOne({
      where: { postId: createFavoriteDto.postId, followerId },
    });

    if (favoriteExist) {
      throw new ConflictException('Post already favorited');
    }

    const favorite = await this.favoriteModel.create({
      followerId,
      ...createFavoriteDto,
    });

    return new SuccessResponse('Favorite Created', favorite);
  }

  async remove(removeFavoriteDto: RemoveFavoriteDto, followerId: string) {
    const post = await this.favoriteModel.findByPk(removeFavoriteDto.postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.favoriteModel.destroy({
      where: { postId: removeFavoriteDto.postId, followerId },
    });

    return new SuccessResponse('Favorite removed successfully');
  }

  async getFavorite(followerId: string, pagination: PaginationDto) {
    const offset = (pagination.page - 1) * pagination.limit;

    const { rows: favorite, count } = await this.favoriteModel.findAndCountAll({
      where: { followerId },
      attributes: ['followerId'],
      include: [
        {
          model: Post,
          attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
        },
      ],
      offset,
      limit: pagination.limit,
    });

    return new PaginationWrapper<Favorite[]>(
      'Favorite Found',
      favorite,
      count,
      pagination.page ?? 1,
      pagination.limit ?? 10,
    );
  }
}
