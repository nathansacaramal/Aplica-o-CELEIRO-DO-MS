import { HomeHighlightEntity } from "../../domain/entities/home-highlight.entity";
import { GetHomeHighlightRepository } from "../../domain/repositories/get-home-highlight.repository";

export class GetHomeHighlightUseCase {
  constructor(private readonly repo: GetHomeHighlightRepository) {}

  async execute(): Promise<HomeHighlightEntity[] | null> {
    return await this.repo.getAll();
  }
}
