import { buildPaginationLinks } from "@/core/http/hateoas/pagination-links";
import { Links } from "@/core/http/http-resource";
import type {
  ListUsersSortDir,
  ListUsersSortField,
} from "@/modules/users/domain/repositories/list-users.repository";

const API_PREFIX = "/api/admin";
const USERS_LIST_PATH = `${API_PREFIX}/users`;

export const userLinks = (id?: number): Links => ({
  self: {
    href: `${API_PREFIX}/users/${id}`,
    method: "GET",
  },
  update: {
    href: `${API_PREFIX}/users/${id}`,
    method: "PATCH",
  },
  delete: {
    href: `${API_PREFIX}/users/${id}`,
    method: "DELETE",
  },
  list: {
    href: `${API_PREFIX}/users`,
    method: "GET",
  },
});

export const usersCollectionLinks = (): Links => ({
  self: {
    href: USERS_LIST_PATH,
    method: "GET",
  },
  create: {
    href: USERS_LIST_PATH,
    method: "POST",
  },
});

/** Links de listagem admin com paginação HATEOAS + criação. */
export function usersAdminListLinks(args: {
  page: number;
  limit: number;
  totalPages: number;
  filters: { name?: string; email?: string };
  sort: { by: ListUsersSortField; dir: ListUsersSortDir };
}): Links {
  const query: Record<string, string | number> = {
    page: args.page,
    limit: args.limit,
    sortBy: args.sort.by,
    sortDir: args.sort.dir,
  };
  if (args.filters.name !== undefined) query.name = args.filters.name;
  if (args.filters.email !== undefined) query.email = args.filters.email;

  const pagination = buildPaginationLinks({
    basePath: USERS_LIST_PATH,
    page: args.page,
    limit: args.limit,
    totalPages: args.totalPages,
    query,
  });

  return {
    ...pagination,
    create: {
      href: USERS_LIST_PATH,
      method: "POST",
    },
  };
}
