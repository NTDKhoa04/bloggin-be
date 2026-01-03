import sequelize from 'sequelize';
import {
  AllowNull,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Collaborator } from 'src/collaborator/model/collaborator.model';

@Table({ timestamps: true })
export class Draft extends Model {
  @PrimaryKey
  @Default(sequelize.UUIDV4)
  @Column
  id: string;

  @AllowNull(false)
  @Column
  authorId: string;

  @AllowNull(false)
  @Column
  title: string;

  @AllowNull(false)
  @Column(DataType.JSON)
  content: object;

  @AllowNull(true)
  @Column(DataType.TEXT)
  yjsContent: string;

  @HasMany(() => Collaborator)
  collaborators: Collaborator[];
}
