import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Collaborator } from './model/collaborator.model';
import { Draft } from 'src/draft/model/draft.model';
import { User } from 'src/user/model/user.model';
import { CollaboratorRole } from 'src/shared/enum/collaborator-role.enum';
import { AddCollaboratorDto } from './dto/add-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import { CollaboratorResponseDto } from './dto/collaborator-response.dto';

export enum DraftPermission {
  READ = 'read',
  WRITE = 'write',
  MANAGE_COLLABORATORS = 'manage_collaborators',
}

@Injectable()
export class CollaboratorService {
  constructor(
    @InjectModel(Collaborator)
    private collaboratorModel: typeof Collaborator,
    @InjectModel(Draft)
    private draftModel: typeof Draft,
    @InjectModel(User)
    private userModel: typeof User,
  ) { }

  async getCollaborators(draftId: string): Promise<CollaboratorResponseDto[]> {
    const collaborators = await this.collaboratorModel.findAll({
      where: { draftId },
    });

    const userIds = collaborators.map((c) => c.userId);

    const users = await this.userModel.findAll({
      where: { id: userIds },
      attributes: ['id', 'username', 'displayName', 'avatarUrl', 'email'],
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const result = collaborators.map((collab) => {
      const user = userMap.get(collab.userId);
      return {
        id: collab.id,
        draftId: collab.draftId,
        userId: collab.userId,
        role: collab.role,
        createdAt: collab.createdAt,
        updatedAt: collab.updatedAt,
        user: user
          ? {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            email: user.email,
          }
          : undefined,
      };
    });



    return result;
  }

  async addCollaborator(
    draftId: string,
    dto: AddCollaboratorDto,
  ): Promise<CollaboratorResponseDto> {
    // Check if user exists by email
    const user = await this.userModel.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const userId = user.id;

    // Check if draft exists
    const draft = await this.draftModel.findByPk(draftId);
    if (!draft) {
      throw new NotFoundException('Draft not found');
    }

    // Check if user is already a collaborator
    const existing = await this.collaboratorModel.findOne({
      where: { draftId, userId: userId },
    });

    if (existing) {
      throw new BadRequestException('User is already a collaborator');
    }

    // Check if user is the owner
    if (draft.authorId === userId) {
      throw new BadRequestException('Owner cannot be added as collaborator');
    }

    const collaborator = await this.collaboratorModel.create({
      draftId,
      userId: userId,
      role: dto.role,
    });

    const fullCollaborator = await this.collaboratorModel.findByPk(
      collaborator.id,
      {
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'displayName', 'avatarUrl', 'email'],
          },
        ],
      },
    );

    if (!fullCollaborator) {
      throw new NotFoundException('Collaborator not found after creation');
    }

    return {
      id: fullCollaborator.id,
      draftId: fullCollaborator.draftId,
      userId: fullCollaborator.userId,
      role: fullCollaborator.role,
      createdAt: fullCollaborator.createdAt,
      updatedAt: fullCollaborator.updatedAt,
      user: fullCollaborator.user
        ? {
          id: fullCollaborator.user.id,
          username: fullCollaborator.user.username,
          displayName: fullCollaborator.user.displayName,
          avatarUrl: fullCollaborator.user.avatarUrl,
          email: fullCollaborator.user.email,
        }
        : undefined,
    };
  }

  async updateCollaborator(
    draftId: string,
    collabId: string,
    dto: UpdateCollaboratorDto,
  ): Promise<CollaboratorResponseDto> {
    const collaborator = await this.collaboratorModel.findOne({
      where: { id: collabId, draftId },
    });

    if (!collaborator) {
      throw new NotFoundException('Collaborator not found');
    }

    collaborator.role = dto.role;
    await collaborator.save();

    const fullCollaborator = await this.collaboratorModel.findByPk(
      collaborator.id,
      {
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'displayName', 'avatarUrl', 'email'],
          },
        ],
      },
    );

    if (!fullCollaborator) {
      throw new NotFoundException('Collaborator not found after update');
    }

    return {
      id: fullCollaborator.id,
      draftId: fullCollaborator.draftId,
      userId: fullCollaborator.userId,
      role: fullCollaborator.role,
      createdAt: fullCollaborator.createdAt,
      updatedAt: fullCollaborator.updatedAt,
      user: fullCollaborator.user
        ? {
          id: fullCollaborator.user.id,
          username: fullCollaborator.user.username,
          displayName: fullCollaborator.user.displayName,
          avatarUrl: fullCollaborator.user.avatarUrl,
          email: fullCollaborator.user.email,
        }
        : undefined,
    };
  }

  async removeCollaborator(draftId: string, collabId: string): Promise<void> {
    const collaborator = await this.collaboratorModel.findOne({
      where: { id: collabId, draftId },
    });

    if (!collaborator) {
      throw new NotFoundException('Collaborator not found');
    }

    await collaborator.destroy();
  }

  async checkPermission(
    draftId: string,
    userId: string,
    permission: DraftPermission,
  ): Promise<boolean> {
    const draft = await this.draftModel.findByPk(draftId);
    if (!draft) {
      throw new NotFoundException('Draft not found');
    }

    // Owner has all permissions
    if (draft.authorId === userId) {
      return true;
    }

    // Check collaborator permissions
    const collaborator = await this.collaboratorModel.findOne({
      where: { draftId, userId },
    });

    if (!collaborator) {
      return false;
    }

    switch (permission) {
      case DraftPermission.READ:
        // Both editor and viewer can read
        return true;
      case DraftPermission.WRITE:
        // Only editor can write
        return collaborator.role === CollaboratorRole.EDITOR;
      case DraftPermission.MANAGE_COLLABORATORS:
        // Only owner can manage collaborators (already handled above)
        return false;
      default:
        return false;
    }
  }

  async getUserRole(
    draftId: string,
    userId: string,
  ): Promise<'owner' | CollaboratorRole | null> {
    const draft = await this.draftModel.findByPk(draftId);
    if (!draft) {
      return null;
    }

    if (draft.authorId === userId) {
      return 'owner';
    }

    const collaborator = await this.collaboratorModel.findOne({
      where: { draftId, userId },
    });

    return collaborator ? collaborator.role : null;
  }
  async removeAllCollaborators(draftId: string): Promise<void> {
    await this.collaboratorModel.destroy({
      where: { draftId },
    });
  }
}
