import sequelize from 'sequelize';
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { Draft } from 'src/draft/model/draft.model';
import { User } from 'src/user/model/user.model';
import { CollaboratorRole } from 'src/shared/enum/collaborator-role.enum';

@Table
export class Collaborator extends Model {
  @PrimaryKey
  @Default(sequelize.UUIDV4)
  @Column
  id: string;

  @AllowNull(false)
  @ForeignKey(() => Draft)
  @Column({ onDelete: 'CASCADE' })
  draftId: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column
  userId: string;

  @AllowNull(false)
  @Default(CollaboratorRole.VIEWER)
  @Column({
    type: DataType.ENUM(...Object.values(CollaboratorRole)),
  })
  role: CollaboratorRole;

  @BelongsTo(() => Draft)
  draft: Draft;

  @BelongsTo(() => User)
  user: User;

  @Default(sequelize.literal('CURRENT_TIMESTAMP'))
  @Column
  createdAt: Date;

  @Default(sequelize.literal('CURRENT_TIMESTAMP'))
  @Column
  updatedAt: Date;
}
