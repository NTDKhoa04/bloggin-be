import { CollaboratorRole } from 'src/shared/enum/collaborator-role.enum';

export class CollaboratorResponseDto {
  id: string;
  draftId: string;
  userId: string;
  role: CollaboratorRole;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    email: string;
  };
}
