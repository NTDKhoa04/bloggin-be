import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './model/comment.model';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/user/model/user.model';
import { Post } from 'src/post/model/post.model';
import {
  PaginationWrapper,
  SuccessResponse,
} from 'src/shared/classes/success-response.class';
import { PaginationDto } from 'src/shared/classes/pagination.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment) private commentModel: typeof Comment,
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Post) private postModel: typeof Post,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const { authorId, postId, content } = createCommentDto;

    const user = this.userModel.findByPk(authorId);
    const post = this.postModel.findByPk(postId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.commentModel.create(createCommentDto);

    return new SuccessResponse<Comment>(
      'Comment created successfully',
      comment,
    );
  }

  async findAllCommentByPostId(id: string, pagination: PaginationDto) {
    const offset = (pagination.page - 1) * pagination.limit;

    const { rows: comments, count } = await this.commentModel.findAndCountAll({
      where: {
        postId: id,
      },
      include: [
        {
          model: User,
          attributes: ['id', 'displayName', 'avatarUrl'],
        },
      ],
      limit: pagination.limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return new PaginationWrapper<Comment[]>(
      'Comments found',
      comments,
      count,
      pagination.page,
      pagination.limit,
    );
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string) {
    const comment = await this.commentModel.findByPk(id);

    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this comment',
      );
    }

    await comment.update(updateCommentDto);

    return new SuccessResponse<Comment>('Comment updated', comment);
  }

  async remove(id: string) {
    const comment = await this.commentModel.findByPk(id);

    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    await comment.destroy();

    return new SuccessResponse<Comment>('Comment deleted');
  }
}
