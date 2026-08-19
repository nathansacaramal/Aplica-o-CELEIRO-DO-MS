import { HomeHighlightEntity, HomeHighlightProps } from "../entities/home-highlight.entity";

export interface CreateHomeHighlightRepository {
  create(input: Omit<HomeHighlightProps, "id">): Promise<HomeHighlightEntity | null>;
}
