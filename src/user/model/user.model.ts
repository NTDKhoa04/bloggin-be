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
  Unique,
} from 'sequelize-typescript';
import { LoginMethodEmun } from 'src/shared/enum/login-method.enum';
import { Comment } from 'src/comment/model/comment.model';
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

  @Default(false)
  @Column
  isVerified: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  isAdmin: boolean;

  @Default(LoginMethodEmun.LOCAL)
  @Column({
    type: DataType.ENUM(...Object.values(LoginMethodEmun)),
  })
  loginMethod: LoginMethodEmun;

  @HasMany(() => Comment)
  comments: Comment[];
}
