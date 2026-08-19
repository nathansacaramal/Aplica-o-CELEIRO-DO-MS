import { CityEntity } from "../entities/city.entity";

export interface FindCityBySlugRepository {
  publicFindBySlug(slug: string): Promise<CityEntity | null>;
}
