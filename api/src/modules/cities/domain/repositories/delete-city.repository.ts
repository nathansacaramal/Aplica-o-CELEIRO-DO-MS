import { Transaction } from "sequelize";

export interface DeleteCityRepository {
  delete(id: number, t?: Transaction): Promise<boolean>;
}
