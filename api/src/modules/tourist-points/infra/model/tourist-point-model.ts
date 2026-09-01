import sequelize from "@/core/database";
import CityModel from "@/modules/cities/infra/model/city-model";
import { DataTypes, Model } from "sequelize";
import { TouristPointCategory } from "../../domain/value-objects/tourist-point-category";

export class TouristPointModel extends Model {
  id!: number;
  cityId!: number;
  citySlug!: string;
  slug!: string;
  name!: string;
  description!: string;
  category!: TouristPointCategory;
  address!: string;
  openingHours!: string;
  imageUrl!: string;
  featured!: boolean;
  published!: boolean;
  city!: CityModel;
}

TouristPointModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cities", // Name of the target model
        key: "id", // Key in the target model that we're referencing
      },
    },
    citySlug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      // Nome fixo evita que `sync({ alter: true })` crie um novo índice único a
      // cada restart em dev (Sequelize não reconhece `unique: true` sem nome
      // como equivalente a um índice já existente).
      unique: "tourist_points_slug_unique",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM("parque", "praça", "museu", "igreja"),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    openingHours: { type: DataTypes.TIME, allowNull: false },
    imageUrl: { type: DataTypes.STRING, allowNull: false },
    featured: { type: DataTypes.BOOLEAN, allowNull: false },
    published: { type: DataTypes.BOOLEAN, allowNull: false },
  },
  {
    sequelize,
    modelName: "tourist-points",
  },
);

TouristPointModel.belongsTo(CityModel, {
  foreignKey: "cityId",
  as: "city",
});

export default TouristPointModel;
