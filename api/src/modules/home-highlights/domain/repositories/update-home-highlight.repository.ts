import { HomeHighlightEntity } from "../entities/home-highlight.entity";

export interface UpdateHomeHighlightRepository {
  update(
    id: number,
    __homeHighlight: Partial<HomeHighlightEntity>,
  ): Promise<HomeHighlightEntity | null>;
}
