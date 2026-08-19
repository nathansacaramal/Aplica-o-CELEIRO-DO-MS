import { Transaction } from "sequelize";
import { CityEntity } from "../entities/city.entity";

export interface EditCityRepository {
  edit(id: number, City: Partial<CityEntity>, t?: Transaction): Promise<CityEntity | null>;
}
