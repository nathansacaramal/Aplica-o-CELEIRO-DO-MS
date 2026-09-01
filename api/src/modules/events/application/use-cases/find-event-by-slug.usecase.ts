import { EventEntity } from "../../domain/entities/event.entity";
import { FindEventBySlugRepository } from "../../domain/repositories/find-event-by-slug.repository";

export class FindEventBySlugUseCase {
  constructor(private readonly repo: FindEventBySlugRepository) {}

  async execute(slug: string): Promise<EventEntity | null> {
    return await this.repo.publicFindBySlug(slug);
  }
}
