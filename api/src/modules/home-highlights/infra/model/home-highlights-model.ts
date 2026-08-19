// src/modules/events/infra/model/event-model.ts
import sequelize from "@/core/database";
import { DataTypes, Model } from "sequelize";
import { HomeHighlightCategory } from "../../domain/value-objects/home-highlight-categories";
class HomeHighLightsModel extends Model {
  id!: number;
  type!: HomeHighlightCategory;
  referenceId!: number;
  title!: string;
  description!: string;
  imageUrl!: string;
  cityName!: string;
  ctaUrl!: string;
  active!: boolean;
  order!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

HomeHighLightsModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    type: { type: DataTypes.STRING, allowNull: false },
    referenceId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    imageUrl: { type: DataTypes.STRING, allowNull: false },
    cityName: { type: DataTypes.STRING, allowNull: false },
    ctaUrl: { type: DataTypes.STRING, allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false },
    order: { type: DataTypes.INTEGER, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "home-highlights",
  },
);

export default HomeHighLightsModel;
