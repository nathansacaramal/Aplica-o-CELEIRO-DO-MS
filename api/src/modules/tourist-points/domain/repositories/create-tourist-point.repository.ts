import { Transaction } from "sequelize";
import { TouristPointEntity } from "../entities/tourist-point.entity";

export interface CreateTouristPointRepository {
  create(data: TouristPointEntity, t?: Transaction): Promise<TouristPointEntity>;
}
