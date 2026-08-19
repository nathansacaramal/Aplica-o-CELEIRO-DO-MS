import { Transaction } from "sequelize";
import { TouristPointEntity } from "../entities/tourist-point.entity";

export interface FindTouristPointByIdRepository {
  findById(id: number, t?: Transaction): Promise<TouristPointEntity | null>;
}
