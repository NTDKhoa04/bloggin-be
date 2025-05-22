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
}
