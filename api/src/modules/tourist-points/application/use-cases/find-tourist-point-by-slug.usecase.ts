import { TouristPointEntity } from "../../domain/entities/tourist-point.entity";
import { FindTouristPointBySlugRepository } from "../../domain/repositories/find-tourist-point-by-slug.repository";

export class FindTouristPointBySlugUseCase {
  constructor(private readonly repo: FindTouristPointBySlugRepository) {}

  async execute(slug: string): Promise<TouristPointEntity | null> {
    return await this.repo.publicFindBySlug(slug);
  }
}
