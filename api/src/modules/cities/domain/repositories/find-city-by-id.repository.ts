import { CityEntity } from "../entities/city.entity";

export interface FindCityByIdRepository {
  findById(id: number): Promise<CityEntity | null>;
}
