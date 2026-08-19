import sequelize from "@/core/database";
import { DataTypes, Model } from "sequelize";
import { UserRole } from "../../domain/value-objects/user-role";

export class User extends Model {
  id!: number;
  email!: string;
  password!: string;
  name!: string;
  role!: UserRole;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // Nome fixo evita que `sync({ alter: true })` crie um novo índice único a
      // cada restart em dev (Sequelize não reconhece `unique: true` sem nome
      // como equivalente a um índice já existente).
      unique: "email",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("Admin"),
      allowNull: false,
      defaultValue: "Admin",
    },
  },
  {
    sequelize,
    modelName: "Users",
  },
);

export default User;
