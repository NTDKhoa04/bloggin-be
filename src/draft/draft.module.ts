import { Module } from '@nestjs/common';
import { DraftService } from './draft.service';
import { DraftController } from './draft.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Draft } from './model/draft.model';
import { User } from 'src/user/model/user.model';
import { CollaboratorModule } from 'src/collaborator/collaborator.module';

@Module({
  controllers: [DraftController],
  providers: [DraftService],
  imports: [
    SequelizeModule.forFeature([Draft, User]),
    CollaboratorModule,
  ],
  exports: [DraftService],
})
export class DraftModule {}
