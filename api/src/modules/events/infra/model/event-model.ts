// src/modules/events/infra/model/event-model.ts
import sequelize from "@/core/database";
import { CityModel } from "@/modules/cities/infra/models/city-model";
import { DataTypes, Model } from "sequelize";

class EventModel extends Model {
  id!: number;
  cityId!: number;
  citySlug!: string;
  name!: string;
  description!: string;
  category!: string;
  startDate!: Date;
  endDate!: Date;
  formattedDate!: string;
  location!: string;
  imageUrl!: string;
  featured!: boolean;
  published!: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

EventModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cities", // Name of the target model
        key: "id", // Key in the target model that we're referencing
      },
    },
    citySlug: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    formattedDate: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    imageUrl: { type: DataTypes.STRING, allowNull: false },
    featured: { type: DataTypes.BOOLEAN, allowNull: false },
    published: { type: DataTypes.BOOLEAN, allowNull: false },
  },
  {
    sequelize,
    tableName: "events",
    timestamps: true,
  },
);

EventModel.belongsTo(CityModel, { foreignKey: "cityId", as: "city" });

export default EventModel;
