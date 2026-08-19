import { normalizePagination } from "@/core/http/pagination";
import { normalizeSort } from "@/core/http/sorting";
import { ListTouristPointsSpecificationRepository } from "../../domain/repositories/list-tourist-points-specification.repository";
import { TOURIST_POINT_SORT_FIELDS, TouristPointSortField } from "../sorting/tourist-point.sort";
import { TouristPointSpecificationBuilder } from "../specifications/tourist-point-spec.builder";

type Input = {
  page?: number;
  limit?: number;

  // filtros
  name?: string;
  city?: string;
  state?: string;
  published?: boolean;

  // ordenação
  sortBy?: TouristPointSortField;
  sortDir?: "ASC" | "DESC" | string;
};

export class ListTouristPointsUseCase {
  constructor(private readonly repo: ListTouristPointsSpecificationRepository) {}

  async execute(params: Input) {
    const { page, limit, offset } = normalizePagination(params, {
      maxLimit: 50,
    });

    const { sortBy, sortDir } = normalizeSort<TouristPointSortField>(
      { sortBy: params.sortBy, sortDir: params.sortDir },
      TOURIST_POINT_SORT_FIELDS,
      { sortBy: "name", sortDir: "ASC" },
    );

    const spec = new TouristPointSpecificationBuilder()
      .withName(params.name)
      .withCity(params.city)
      .withState(params.state)
      .withPublished(params.published)
      .build();

    const order: [string, "ASC" | "DESC"][] = [[sortBy, sortDir]];

    const { rows, count } = await this.repo.listSpec({
      spec,
      limit,
      offset,
      order,
    });

    return {
      items: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      sort: { sortBy, sortDir },
    };
  }
}
