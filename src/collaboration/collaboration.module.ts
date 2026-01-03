import { Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaboratorModule } from 'src/collaborator/collaborator.module';
import { DraftModule } from 'src/draft/draft.module';

@Module({
  imports: [CollaboratorModule, DraftModule],
  providers: [CollaborationGateway],
})
export class CollaborationModule {}
