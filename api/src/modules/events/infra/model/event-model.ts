// src/modules/events/infra/model/event-model.ts
import sequelize from "@/core/database";
import { CityModel } from "@/modules/cities/infra/model/city-model";
import { DataTypes, Model } from "sequelize";

class EventModel extends Model {
  id!: number;
  cityId!: number;
  citySlug!: string;
  slug!: string;
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
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      // Nome fixo evita que `sync({ alter: true })` crie um novo índice único a
      // cada restart em dev (Sequelize não reconhece `unique: true` sem nome
      // como equivalente a um índice já existente).
      unique: "events_slug_unique",
    },
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
