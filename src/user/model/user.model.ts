import sequelize from "sequelize";
import { Column, Default, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table
export class User extends Model {

    @PrimaryKey
    @Default(sequelize.UUIDV4)
    @Column
    id: string;

    @Column
    password: string;

    @Column
    username: string;

    @Column
    email: string;

    @Column
    displayName: string;
        
}