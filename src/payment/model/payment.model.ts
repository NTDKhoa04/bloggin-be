import sequelize from 'sequelize';
import {
  AllowNull,
  BelongsTo,
  Column,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/model/user.model';

@Table({ timestamps: true })
export class Payment extends Model {
  @PrimaryKey
  @Default(sequelize.UUIDV4)
  @Column
  id: string;

  @ForeignKey(() => User)
  @Column
  userId: string;

  @Column
  sepayId: string;

  @Column
  gateway: string;

  @Column
  accountNumber: string;

  @Column
  transactionDate: Date;

  @AllowNull(true)
  @Column
  code?: string;

  @Column
  amount: number;

  @BelongsTo(() => User)
  user: User;
}
