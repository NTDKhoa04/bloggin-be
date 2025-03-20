import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/model/user.model';

@Table({ timestamps: false })
export class Follow extends Model {
  @ForeignKey(() => User)
  @Column({
    primaryKey: true,
    allowNull: false,
  })
  authorId: string;

  @ForeignKey(() => User)
  @Column({
    primaryKey: true,
    allowNull: false,
  })
  followerId: string;

  @BelongsTo(() => User)
  author: User;

  @BelongsTo(() => User)
  follower: User;
}
