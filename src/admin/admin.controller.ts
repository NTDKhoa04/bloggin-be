import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SuccessResponse } from 'src/shared/classes/success-response.class';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { AdminService } from './admin.service';
import {
  GetPostByMonitoringStatusDto,
  GetPostByMonitoringStatusSchema,
} from './dto/get-post-by-monitoring-status.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get('statistics/top-followed-user')
  async getTopFollowedUser(@Query('top') top?: number) {
    const res = await this.adminService.getTopFollowedUser(top);
    return new SuccessResponse('Get top followed user successfully', res);
  }

  @Get('statistics/top-tag')
  async getTopTag(@Query('top') top?: number) {
    const res = await this.adminService.getTopTag(top);
    return new SuccessResponse('Get top topics successfully', res);
  }

  @Get('statistics/overall')
  async getOverallStatistics() {
    const res = await this.adminService.getAdminOverallStats();
    return new SuccessResponse('Get overall statistics successfully', res);
  }

  @Get('statistics/user-registration')
  async getMonthlyUserRegistration() {
    const res = await this.adminService.getMonthlyUserResgistration();
    return new SuccessResponse(
      'Get monthly user registration successfully',
      res,
    );
  }

  @Get('statistics/post-upload')
  async getMonthlyPostUpload() {
    const res = await this.adminService.getMonthlyPostUpload();
    return new SuccessResponse('Get monthly post upload successfully', res);
  }

  @Get('statistics/tag-distribution')
  async getTagDistribution() {
    const res = await this.adminService.getTagDistribution();
    return new SuccessResponse('Get monthly post upload successfully', res);
  }

  @Get('statistics/top-interactive-post')
  async getTopInteractivePost() {
    const res = await this.adminService.getTopInteractivePost();
    return new SuccessResponse('Get top interactive post successfully', res);
  }

  @Patch('/flag-post/:postId')
  async flagPost(@Param('postId') postId: string) {
    var flaggedPost = await this.adminService.flagPost(postId);
    return new SuccessResponse(`Post has been flagged`, flaggedPost);
  }

  @Patch('/unflag-post/:postId')
  async unflagPost(@Param('postId') postId: string) {
    var unflaggedPost = await this.adminService.unflagPost(postId);
    return new SuccessResponse(`Post has been unflagged`, unflaggedPost);
  }

  @Get('post')
  async getPostByMonitoringStatus(
    @Query(new ZodValidationPipe(GetPostByMonitoringStatusSchema))
    query: GetPostByMonitoringStatusDto,
  ) {
    const res = await this.adminService.getPostsByMonitoringStatus(
      query.status,
    );
    return new SuccessResponse(`Get ${query.status} post successfully`, res);
  }
}
