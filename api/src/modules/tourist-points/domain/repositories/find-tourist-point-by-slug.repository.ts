import { TouristPointEntity } from "../entities/tourist-point.entity";

export interface FindTouristPointBySlugRepository {
  publicFindBySlug(slug: string): Promise<TouristPointEntity | null>;
}
