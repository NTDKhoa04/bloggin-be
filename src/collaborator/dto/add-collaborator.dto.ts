import { IsEnum, IsNotEmpty, IsUUID, IsEmail } from 'class-validator';
import { CollaboratorRole } from 'src/shared/enum/collaborator-role.enum';

export class AddCollaboratorDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEnum(CollaboratorRole)
  role: CollaboratorRole;
}
