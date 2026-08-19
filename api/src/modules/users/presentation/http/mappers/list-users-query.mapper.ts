import type { ListUsersQueryDTO } from "@/modules/users/application/dto";
import type {
  ListUsersSearchParams,
  ListUsersSortField,
} from "@/modules/users/domain/repositories/list-users.repository";

const DEFAULT_SORT_BY: ListUsersSortField = "name";

export function toListUsersSearchParams(query: ListUsersQueryDTO): ListUsersSearchParams {
  return {
    page: query.page,
    limit: query.limit,
    ...(query.name !== undefined ? { nameContains: query.name } : {}),
    ...(query.email !== undefined ? { emailEquals: query.email } : {}),
    sortBy: query.sortBy ?? DEFAULT_SORT_BY,
    sortDir: query.sortDir,
  };
}
