import sequelize, { literal } from 'sequelize';
import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Comment } from 'src/comment/model/comment.model';
import { Post_Tag } from 'src/post-tag/model/post-tag.model';
import { Tag } from 'src/tag/model/tag.model';
import { User } from 'src/user/model/user.model';

@Table
export class Post extends Model {
  @PrimaryKey
  @Default(sequelize.UUIDV4)
  @Column
  id: string;

  @AllowNull(false)
  @Column
  @ForeignKey(() => User)
  authorId: string;

  @AllowNull(false)
  @Column
  title: string;

  @AllowNull(false)
  @Column(DataType.JSON)
  content: object;

  @Default(literal('CURRENT_TIMESTAMP'))
  @Column
  createdAt: Date;

  @Default(literal('CURRENT_TIMESTAMP'))
  @Column
  updatedAt?: Date;

  @BelongsToMany(() => Tag, () => Post_Tag)
  tags: Tag[];

  @BelongsTo(() => User)
  author: User;

  @HasMany(() => Comment)
  comments: Comment[];
}
