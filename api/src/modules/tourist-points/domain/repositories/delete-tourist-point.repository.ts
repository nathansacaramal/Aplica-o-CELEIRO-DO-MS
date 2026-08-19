import { Transaction } from "sequelize";

export interface DeleteTouristPointRepository {
  delete(id: number, t?: Transaction): Promise<boolean>;
}
