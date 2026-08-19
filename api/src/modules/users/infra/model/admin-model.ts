import sequelize from "@/core/database";
import { DataTypes, Model } from "sequelize";
import User from "./user-model";

class Admin extends Model {
  id!: number;
  name!: string;
  email!: string;
  phone!: string;
  userId!: number;
  user!: User; // Associação com o modelo User
}

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "admins",
  },
);
Admin.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
export default Admin;
