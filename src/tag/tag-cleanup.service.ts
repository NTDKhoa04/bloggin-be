import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Tag } from './model/tag.model';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class TagCleanupService {
  private readonly logger = new Logger(TagCleanupService.name);

  constructor(private readonly sequelize: Sequelize) {}

  @Cron(CronExpression.EVERY_10_MINUTES) // Chạy mỗi phút
  async cleanupUnusedTags() {
    this.logger.log('Running tag cleanup job...');

    try {
      const [_result, metadata] = await this.sequelize.query(`
        DELETE FROM "Tags" 
        WHERE id NOT IN (SELECT DISTINCT "tagId" FROM "Post_Tags")
      `);

      const deletedCount = (metadata as any).rowCount;
      this.logger.log(`Deleted ${deletedCount} unused tags.`);
    } catch (error) {
      this.logger.error('Error while cleaning up tags', error);
    }
  }
}
