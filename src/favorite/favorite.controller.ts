import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import {
  CreateFavoriteDto,
  CreateFavoriteSchema,
} from './dto/create-favorite.dto';
import {
  RemoveFavoriteDto,
  RemoveFavoriteSchema,
} from './dto/remove-favorite.dto';
import {
  PaginationDto,
  PaginationSchema,
} from 'src/shared/classes/pagination.dto';
import { Me } from 'src/shared/decorators/user.decorator';
import { User } from 'src/user/model/user.model';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { LoggedInOnly } from 'src/auth/guards/authenticated.guard';
import { SuccessResponse } from 'src/shared/classes/success-response.class';

@Controller({ path: 'favorite', version: '1' })
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  @UseGuards(LoggedInOnly)
  create(
    @Body(new ZodValidationPipe(CreateFavoriteSchema))
    createFavoriteDto: CreateFavoriteDto,
    @Me() user: Partial<User>,
  ) {
    const { id: userId, ...userWithoutId } = user;

    return this.favoriteService.create(createFavoriteDto, userId ?? '');
  }

  @Delete()
  @UseGuards(LoggedInOnly)
  remove(
    @Body(new ZodValidationPipe(RemoveFavoriteSchema))
    removeFavoriteDto: RemoveFavoriteDto,
    @Me() user: Partial<User>,
  ) {
    const { id: userId, ...userWithoutId } = user;

    return this.favoriteService.remove(removeFavoriteDto, userId ?? '');
  }

  @UseGuards(LoggedInOnly)
  @Get()
  getFavoriteers(
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationDto,
    @Me() user: Partial<User>,
  ) {
    const { id, ...userWithoutId } = user;
    return this.favoriteService.getFavorite(id ? id : '', pagination);
  }

  @Get(':postId/count')
  async getFavoriteCount(
    @Param('postId') postId: string,
    @Me() user?: Partial<User>,
  ) {
    const res = await this.favoriteService.getFavoriteCount(postId, user?.id);
    return new SuccessResponse('Success', res);
  }
}
