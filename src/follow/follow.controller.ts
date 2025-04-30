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
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { RemoveFollowDto } from './dto/remove-follow.dto';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import {
  PaginationDto,
  PaginationSchema,
} from 'src/shared/classes/pagination.dto';
import { Me } from 'src/shared/decorators/user.decorator';
import { User } from 'src/user/model/user.model';
import { LoggedInOnly } from 'src/auth/guards/authenticated.guard';

@Controller({ path: 'follow', version: '1' })
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @UseGuards(LoggedInOnly)
  @Post()
  @UseGuards(LoggedInOnly)
  create(@Body() createFollowDto: CreateFollowDto, @Me() user: Partial<User>) {
    const { id: followerId, ...userWithoutId } = user;

    return this.followService.create(createFollowDto, followerId ?? '');
  }

  @UseGuards(LoggedInOnly)
  @Delete()
  @UseGuards(LoggedInOnly)
  remove(@Body() removeFollowDto: RemoveFollowDto, @Me() user: Partial<User>) {
    const { id: followerId, ...userWithoutId } = user;

    return this.followService.remove(removeFollowDto, followerId ?? '');
  }

  @UseGuards(LoggedInOnly)
  @Get('follower')
  getFollowers(
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationDto,
    @Me() user: Partial<User>,
  ) {
    const { id, ...userWithoutId } = user;
    return this.followService.getFollowers(id ? id : '', pagination);
  }

  @UseGuards(LoggedInOnly)
  @Get('following')
  getFollowing(
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationDto,
    @Me() user: Partial<User>,
  ) {
    const { id, ...userWithoutId } = user;
    return this.followService.getFollowing(id ? id : '', pagination);
  }

  @Get(':userId/follower')
  getUserFollower(
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationDto,
    @Param('userId') userId: string,
  ) {
    return this.followService.getFollowers(userId, pagination);
  }

  @Get(':userId/following')
  getUserFollowing(
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationDto,
    @Param('userId') userId: string,
  ) {
    return this.followService.getFollowing(userId, pagination);
  }
}
