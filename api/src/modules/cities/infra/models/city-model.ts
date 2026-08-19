import sequelize from "@/core/database";
import { DataTypes, Model } from "sequelize";

export class CityModel extends Model {
  id!: number;
  name!: string;
  slug!: string;
  state!: string;
  summary!: string;
  description!: string;
  imageUrl!: string;
  published!: boolean;
}

CityModel.init(
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
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      // Nome fixo evita que `sync({ alter: true })` crie um novo índice único a
      // cada restart em dev (Sequelize não reconhece `unique: true` sem nome
      // como equivalente a um índice já existente).
      unique: "cities_slug_unique",
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    summary: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "cities",
    tableName: "cities",
  },
);

export default CityModel;
