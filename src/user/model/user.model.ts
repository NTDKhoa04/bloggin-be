import sequelize from 'sequelize';
import {
  AllowNull,
  BelongsToMany,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { LoginMethodEmun } from 'src/shared/enum/login-method.enum';
import { Comment } from 'src/comment/model/comment.model';
import { Follow } from 'src/follow/model/follow.model';
import { RoleEnum } from 'src/shared/enum/role.enum';
import { Payment } from 'src/payment/model/payment.model';
@Table
export class User extends Model {
  @PrimaryKey
  @Default(sequelize.UUIDV4)
  @Column
  id: string;

  @AllowNull(true)
  @Column
  password: string;

  @AllowNull(false)
  @Unique({ name: 'user_taken', msg: 'Username is taken' })
  @Column
  username: string;

  @AllowNull(false)
  @Unique({ name: 'email_taken', msg: 'Email is taken' })
  @Column
  email: string;

  @AllowNull(false)
  @Column
  displayName: string;

  @AllowNull(true)
  @Column
  avatarUrl: string;

  @AllowNull(true)
  @Column
  specialties: string;

  @AllowNull(true)
  @Column
  about: string;

  @Default(false)
  @Column
  isVerified: boolean;

  @Default(RoleEnum.USER)
  @AllowNull(true)
  @Column({
    type: DataType.ENUM(...Object.values(RoleEnum)),
  })
  role: RoleEnum;

  @Default(LoginMethodEmun.LOCAL)
  @Column({
    type: DataType.ENUM(...Object.values(LoginMethodEmun)),
  })
  loginMethod: LoginMethodEmun;

  @HasMany(() => Comment)
  comments: Comment[];

  @BelongsToMany(() => User, () => Follow, 'followerId', 'authorId')
  following: User[];

  @BelongsToMany(() => User, () => Follow, 'authorId', 'followerId')
  followers: User[];

  @HasMany(() => Payment)
  payments: Payment[];
}
