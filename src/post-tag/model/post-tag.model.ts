import sequelize, { literal } from 'sequelize';
import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { Post } from 'src/post/model/post.model';
import { Tag } from 'src/tag/model/tag.model';

@Table({ timestamps: false })
export class Post_Tag extends Model {
  @ForeignKey(() => Post)
  @Column({
    primaryKey: true,
    allowNull: false,
  })
  postId: string;

  @ForeignKey(() => Tag)
  @Column({
    primaryKey: true,
    allowNull: false,
  })
  tagId: string;

  @BelongsTo(() => Post)
  post: Post;

  @BelongsTo(() => Tag)
  tag: Tag;
}
