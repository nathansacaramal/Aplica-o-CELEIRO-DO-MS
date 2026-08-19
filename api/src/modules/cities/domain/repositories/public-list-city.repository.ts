import { CityEntity } from "../entities/city.entity";

export interface PublicListCityRepository {
  publicList(): Promise<CityEntity[] | null>;
}
