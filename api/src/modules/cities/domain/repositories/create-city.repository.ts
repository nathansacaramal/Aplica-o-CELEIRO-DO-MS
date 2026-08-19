import { Transaction } from "sequelize";
import { CityEntity } from "../entities/city.entity";

export interface CreateCityRepository {
  create(city: CityEntity, t?: Transaction): Promise<CityEntity>;
}
