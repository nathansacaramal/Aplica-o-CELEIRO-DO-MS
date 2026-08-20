import sequelize from "@/core/database";
import { DataTypes, Model } from "sequelize";

export class SettingModel extends Model {
  id!: number;
  key!: string;
  value!: unknown;
  createdAt!: Date;
  updatedAt!: Date;
}

SettingModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      // Nome fixo evita que `sync({ alter: true })` crie um novo índice único a
      // cada restart em dev (Sequelize não reconhece `unique: true` sem nome
      // como equivalente a um índice já existente).
      unique: "site_settings_key_unique",
    },
    value: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "site-settings",
    tableName: "site-settings",
  },
);

export default SettingModel;
