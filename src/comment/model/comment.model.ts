import sequelize from 'sequelize';
import {
  AllowNull,
  Column,
  Default,
  Model,
  PrimaryKey,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Post } from 'src/post/model/post.model';
import { User } from 'src/user/model/user.model';

@Table({ timestamps: true })
export class Comment extends Model {
  @PrimaryKey
  @Default(sequelize.UUIDV4)
  @Column
  id: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column
  authorId: string;

  @ForeignKey(() => Post)
  @Column
  postId: string;

  @Column
  content: string;

  @BelongsTo(() => User)
  author: User;
}
