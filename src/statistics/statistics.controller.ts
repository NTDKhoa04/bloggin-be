import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { SuccessResponse } from 'src/shared/classes/success-response.class';

@Controller({ path: 'statistics', version: '1' })
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}
  @Get('top-followed-user')
  async getTopFollowedUser(@Query('top') top?: number) {
    const res = await this.statisticsService.getTopFollowedUser(top);
    return new SuccessResponse('Get top followed user successfully', res);
  }

  @Get('top-tag')
  async getTopTag(@Query('top') top?: number) {
    const res = await this.statisticsService.getTopTag(top);
    return new SuccessResponse('Get top topics successfully', res);
  }

  @Get('overall')
  async getOverallStatistics() {
    const res = await this.statisticsService.getAdminOverallStats();
    return new SuccessResponse('Get overall statistics successfully', res);
  }

  @Get('user-registration')
  async getMonthlyUserRegistration() {
    const res = await this.statisticsService.getMonthlyUserResgistration();
    return new SuccessResponse(
      'Get monthly user registration successfully',
      res,
    );
  }

  @Get('post-upload')
  async getMonthlyPostUpload() {
    const res = await this.statisticsService.getMonthlyPostUpload();
    return new SuccessResponse('Get monthly post upload successfully', res);
  }

  @Get('tag-distribution')
  async getTagDistribution() {
    const res = await this.statisticsService.getTagDistribution();
    return new SuccessResponse('Get monthly post upload successfully', res);
  }

  @Get('top-interactive-post')
  async getTopInteractivePost() {
    const res = await this.statisticsService.getTopInteractivePost();
    return new SuccessResponse('Get top interactive post successfully', res);
  }
}
