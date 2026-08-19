import { SearchHotelsController } from "../controllers/search-hotels.controller";

export function makeSearchHotelsController() {
  return new SearchHotelsController();
}
