import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import { ListBlogPostsDTO, ListBlogPostsResult } from "../dto";
import { ListBlogPostsRepository } from "../../domain/repositories/list-blog-posts.repository";

const toNumber = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const normalizeSort = (by?: string, dir?: string) => {
  const safeDir = (String(dir).toLowerCase() === "asc" ? "asc" : "desc") as "asc" | "desc";
  const safeBy = by && typeof by === "string" ? by : "dataPublicacao";
  return { by: safeBy, dir: safeDir };
};

export class ListBlogPostsUseCase {
  constructor(
    private readonly repo: ListBlogPostsRepository,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute(input: ListBlogPostsDTO): Promise<ListBlogPostsResult> {
    const page = toNumber(input.page, 1);
    const limit = toNumber(input.limit, 10);
    const sort = normalizeSort(input.sortBy, input.sortDir as string);

    const filters = {
      titulo: input.titulo,
      status: input.status,
      onlyPublished: input.onlyPublished,
    };

    const result = await this.repo.list({ page, limit, filters, sort });

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
