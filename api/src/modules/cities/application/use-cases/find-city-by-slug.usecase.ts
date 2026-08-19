import { CityEntity } from "../../domain/entities/city.entity";
import { FindCityBySlugRepository } from "../../domain/repositories/find-city-by-slug.repository";

export class FindCityBySlugUsecase {
  constructor(private readonly repo: FindCityBySlugRepository) {}

  async execute(slug: string): Promise<CityEntity | null> {
    return await this.repo.publicFindBySlug(slug);
  }
}
