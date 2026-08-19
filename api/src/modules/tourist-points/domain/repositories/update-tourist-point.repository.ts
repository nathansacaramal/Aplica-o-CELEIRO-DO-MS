import { Transaction } from "sequelize";
import { TouristPointEntity, TouristPointProps } from "../entities/tourist-point.entity";

export interface UpdateTouristPointRepository {
  update(
    id: number,
    data: Partial<TouristPointProps>,
    t?: Transaction,
  ): Promise<TouristPointEntity | null>;
}
