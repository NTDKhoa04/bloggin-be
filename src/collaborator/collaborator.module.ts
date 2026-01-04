import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Collaborator } from './model/collaborator.model';
import { Draft } from 'src/draft/model/draft.model';
import { User } from 'src/user/model/user.model';
import { CollaboratorService } from './collaborator.service';
import { CollaboratorController } from './collaborator.controller';

@Module({
  imports: [SequelizeModule.forFeature([Collaborator, Draft, User])],
  controllers: [CollaboratorController],
  providers: [CollaboratorService],
  exports: [CollaboratorService],
})
export class CollaboratorModule {}
