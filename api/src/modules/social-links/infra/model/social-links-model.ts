import sequelize from "@/core/database";
import { DataTypes, Model } from "sequelize";

class SocialMediaLinksModel extends Model {
  id!: number;
  platform!: string;
  label!: string;
  url!: string;
  active!: boolean;
  order!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

SocialMediaLinksModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    platform: { type: DataTypes.STRING, allowNull: false },
    label: { type: DataTypes.STRING, allowNull: false },
    url: { type: DataTypes.STRING, allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    order: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: "social-media-links",
    timestamps: true,
  },
);

export default SocialMediaLinksModel;
