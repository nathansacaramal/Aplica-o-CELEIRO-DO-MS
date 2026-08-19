import { CityEntity } from "../entities/city.entity";

export interface FindCityByNameRepository {
  findByName(nome: string): Promise<CityEntity | null>;
}
