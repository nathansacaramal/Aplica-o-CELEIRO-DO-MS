import sequelize from "@/core/database";
import CityModel from "@/modules/cities/infra/models/city-model";
import { DataTypes, Model } from "sequelize";
import { TouristPointCategory } from "../../domain/value-objects/tourist-point-category";

export class TouristPointModel extends Model {
  id!: number;
  cityId!: number;
  citySlug!: string;
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
