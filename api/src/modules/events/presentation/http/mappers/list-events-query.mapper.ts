import type { ListEventsDTO } from "@/modules/events/application/dto";
import { isEventCategory } from "@/modules/events/domain/value-objects/event-category";
import type { ListEventsQueryDTO } from "../validators/event-schemas";

export function toListEventsUseCaseInput(query: ListEventsQueryDTO): ListEventsDTO {
  return {
    page: query.page,
    limit: query.limit,
    name: query.name,
    category:
      query.category !== undefined && isEventCategory(query.category) ? query.category : undefined,
    cityId: query.cityId,
    sortBy: query.sortBy,
    sortDir: query.sortDir,
  };
}
