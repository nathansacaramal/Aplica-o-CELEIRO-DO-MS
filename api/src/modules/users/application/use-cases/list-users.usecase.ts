import { ListUsersRepository } from "../../domain/repositories/list-users.repository";
import type { ListUsersSearchParams } from "../../domain/repositories/list-users.repository";
import { ListUsersResult } from "../dto";
import { logger } from "@/core/config/logger";

export class ListUsersUseCase {
  constructor(private readonly listUsersRepo: ListUsersRepository) {}

  async execute(params: ListUsersSearchParams): Promise<ListUsersResult> {
    const page = await this.listUsersRepo.list(params);
    const totalPages = Math.max(1, Math.ceil(page.total / page.limit));

    logger.debug("ListUsersUseCase: usuários listados", {
      total: page.total,
      page: page.page,
    });

    return {
      items: page.items,
      total: page.total,
      page: page.page,
      limit: page.limit,
      totalPages,
      sort: { by: params.sortBy, dir: params.sortDir },
    };
  }
}
