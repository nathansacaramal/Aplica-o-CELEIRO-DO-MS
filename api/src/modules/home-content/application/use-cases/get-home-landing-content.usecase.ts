import { GetHomeHighlightRepository } from "@/modules/home-highlights/domain/repositories/get-home-highlight.repository";
import { HomeHighlightEntity } from "@/modules/home-highlights/domain/entities/home-highlight.entity";

export interface HomeLandingContentResult {
  highlights: HomeHighlightEntity[];
}

export class GetHomeLandingContentUseCase {
  constructor(private readonly highlightsRepo: GetHomeHighlightRepository) {}

  async execute(): Promise<HomeLandingContentResult> {
    const highlights = await this.highlightsRepo.getAll();

    return {
      highlights: highlights ?? [],
    };
  }
}
