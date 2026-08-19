import { HomeHighlightEntity } from "../../domain/entities/home-highlight.entity";
import { FindHomeHighlightByIdRepository } from "../../domain/repositories/find-home-highlight-by-id.repository";

export class FindHomeHighlightByIdUseCase {
  constructor(private readonly repo: FindHomeHighlightByIdRepository) {}

  async execute(id: number): Promise<HomeHighlightEntity | null> {
    return await this.repo.findById(id);
  }
}
