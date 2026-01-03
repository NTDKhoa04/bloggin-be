import { IsEnum, IsNotEmpty } from 'class-validator';
import { CollaboratorRole } from 'src/shared/enum/collaborator-role.enum';

export class UpdateCollaboratorDto {
  @IsNotEmpty()
  @IsEnum(CollaboratorRole)
  role: CollaboratorRole;
}
