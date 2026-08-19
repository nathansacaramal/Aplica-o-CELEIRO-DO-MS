import type { ListTouristPointsUseCase } from "../../../application/use-cases/list-tourist-points.usecase";
import type { ListTouristPointsQueryDTO } from "../validators/tourist-point-schemas";

type ListTouristPointsInput = Parameters<ListTouristPointsUseCase["execute"]>[0];

export function toListTouristPointsUseCaseInput(
  query: ListTouristPointsQueryDTO,
): ListTouristPointsInput {
  return {
    page: query.page,
    limit: query.limit,
    name: query.name,
    city: query.city,
    state: query.state,
    published: query.published === "true" ? true : query.published === "false" ? false : undefined,
    sortBy: query.sortBy,
    sortDir: query.sortDir,
  };
}
