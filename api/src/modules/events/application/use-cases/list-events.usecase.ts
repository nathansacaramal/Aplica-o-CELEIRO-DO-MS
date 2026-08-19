import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import { ListEventsDTO, ListEventsResult } from "../dto";
import { ListEventsRepository } from "../../domain/repositories/list-events.repository";

const toNumber = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const normalizeSort = (by?: string, dir?: string) => {
  const safeDir = (String(dir).toLowerCase() === "asc" ? "asc" : "desc") as "asc" | "desc";
  const safeBy = by && typeof by === "string" ? by : "createdAt";
  return { by: safeBy, dir: safeDir };
};

export class ListEventsUseCase {
  constructor(
    private readonly repo: ListEventsRepository,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute(input: ListEventsDTO): Promise<ListEventsResult> {
    const page = toNumber(input.page, 1);
    const limit = toNumber(input.limit, 10);
    const sort = normalizeSort(input.sortBy, input.sortDir as string);

    const filters = {
      name: input.name,
      category: input.category,
      cityId: input.cityId !== undefined ? Number(input.cityId) : undefined,
    };

    const result = await this.repo.list({
      page,
      limit,
      filters,
      sort,
    });

    const totalPages = Math.max(1, Math.ceil(result.total / limit));

    return {
      items: result.items,
      total: result.total,
      page,
      limit,
      totalPages,
      sort,
    };
  }
}
