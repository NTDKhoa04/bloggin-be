import sequelize from 'sequelize';
import {
  AllowNull,
  BelongsToMany,
  Column,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Post_Tag } from 'src/post-tag/model/post-tag.model';
import { Post } from 'src/post/model/post.model';

@Table({ timestamps: false })
export class Tag extends Model {
  @PrimaryKey
  @Default(sequelize.UUIDV4)
  @Column
  id: string;

  @AllowNull(false)
  @Column
  name: string;

  @BelongsToMany(() => Post, () => Post_Tag)
  posts: Post[];
}
