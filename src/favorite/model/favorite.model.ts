import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Post } from 'src/post/model/post.model';
import { User } from 'src/user/model/user.model';

@Table({ timestamps: false })
export class Favorite extends Model {
  @ForeignKey(() => Post)
  @Column({
    primaryKey: true,
    allowNull: false,
  })
  postId: string;

  @ForeignKey(() => User)
  @Column({
    primaryKey: true,
    allowNull: false,
  })
  followerId: string;

  @BelongsTo(() => Post, { foreignKey: 'postId' })
  post: Post;

  @BelongsTo(() => User, { foreignKey: 'followerId' })
  follower: User;
}
