import { EventEntity } from "../entities/event.entity";

export interface FindEventBySlugRepository {
  publicFindBySlug(slug: string): Promise<EventEntity | null>;
}
