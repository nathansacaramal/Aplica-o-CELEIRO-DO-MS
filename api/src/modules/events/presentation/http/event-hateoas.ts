import { buildPaginationLinks } from "@/core/http/hateoas/pagination-links";
import { Links } from "@/core/http/http-resource";

type SortDir = "asc" | "desc";
const API_ADMIN_PREFIX = "/api/admin";
const API_PUBLIC_PREFIX = "/api/public";

const EVENTS_ADMIN_BASE = `${API_ADMIN_PREFIX}/events`;
const EVENTS_PUBLIC_BASE = `${API_PUBLIC_PREFIX}/events`;

export function eventPublicLinks(id: string | number): Links {
  const eventId = String(id);
  return {
    self: { href: `${API_PUBLIC_PREFIX}/events/${eventId}`, method: "GET" },
    list: { href: `${API_PUBLIC_PREFIX}/events`, method: "GET" },
  };
}

export function eventLinks(id: string | number): Links {
  const eventId = String(id);

  return {
    self: { href: `${API_ADMIN_PREFIX}/events/${eventId}`, method: "GET" },
    update: { href: `${API_ADMIN_PREFIX}/events/${eventId}`, method: "PATCH" },
    delete: { href: `${API_ADMIN_PREFIX}/events/${eventId}`, method: "DELETE" },
    list: { href: `${API_ADMIN_PREFIX}/events`, method: "GET" },
  };
}

type ListLinksParams = {
  page: number;
  limit: number;
  totalPages: number;
  filters?: Record<string, string | number | boolean | undefined>;
  sort?: { by?: string; dir?: SortDir };
};

export function eventListLinks(params: ListLinksParams): Links {
  const query: Record<string, string | number | boolean | undefined> = {
    limit: params.limit,
    ...(params.filters ?? {}),
  };
  if (params.sort?.by !== undefined) query.sortBy = params.sort.by;
  if (params.sort?.dir !== undefined) query.sortDir = params.sort.dir;

  return buildPaginationLinks({
    basePath: EVENTS_ADMIN_BASE,
    page: params.page,
    limit: params.limit,
    totalPages: params.totalPages,
    query,
  });
}

export function eventPublicListLinks(params: ListLinksParams): Links {
  const query: Record<string, string | number | boolean | undefined> = {
    limit: params.limit,
    ...(params.filters ?? {}),
  };
  if (params.sort?.by !== undefined) query.sortBy = params.sort.by;
  if (params.sort?.dir !== undefined) query.sortDir = params.sort.dir;

  return buildPaginationLinks({
    basePath: EVENTS_PUBLIC_BASE,
    page: params.page,
    limit: params.limit,
    totalPages: params.totalPages,
    query,
  });
}
