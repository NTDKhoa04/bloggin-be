import sequelize from 'sequelize';
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasOne,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
@Table
export class User extends Model {
  @PrimaryKey
  @Default(sequelize.UUIDV4)
  @Column
  id: string;

  @AllowNull(false)
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

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  isAdmin: Boolean;
}
