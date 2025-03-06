import sequelize, { literal } from 'sequelize';
import {
  AllowNull,
  Column,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table
export class Post extends Model {
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
  @Column
  content: string;

  @Default(literal('CURRENT_TIMESTAMP'))
  @Column
  createdAt: Date;

  @Default(literal('CURRENT_TIMESTAMP'))
  @Column
  updatedAt?: Date;
}
