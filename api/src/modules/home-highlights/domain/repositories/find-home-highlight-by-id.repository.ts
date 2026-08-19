import { HomeHighlightEntity } from "../entities/home-highlight.entity";

export interface FindHomeHighlightByIdRepository {
  findById(id: number): Promise<HomeHighlightEntity | null>;
}
