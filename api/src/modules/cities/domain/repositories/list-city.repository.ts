import { CityEntity } from "../entities/city.entity";

export interface ListCityRepository {
  list(): Promise<CityEntity[]>;
}
