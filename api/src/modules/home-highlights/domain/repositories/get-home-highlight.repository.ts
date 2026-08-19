import { HomeHighlightEntity } from "../entities/home-highlight.entity";

export interface GetHomeHighlightRepository {
  getAll(): Promise<HomeHighlightEntity[] | null>;
}
