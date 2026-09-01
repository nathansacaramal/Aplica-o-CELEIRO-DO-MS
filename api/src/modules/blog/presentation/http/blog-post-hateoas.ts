import { buildPaginationLinks } from "@/core/http/hateoas/pagination-links";
import { Links } from "@/core/http/http-resource";

type SortDir = "asc" | "desc";
const API_ADMIN_PREFIX = "/api/admin";
const API_PUBLIC_PREFIX = "/api/public";

const BLOG_ADMIN_BASE = `${API_ADMIN_PREFIX}/blog`;
const BLOG_PUBLIC_BASE = `${API_PUBLIC_PREFIX}/blog`;

export function blogPostLinks(id: string | number): Links {
  const postId = String(id);

  return {
    self: { href: `${API_ADMIN_PREFIX}/blog/${postId}`, method: "GET" },
    update: { href: `${API_ADMIN_PREFIX}/blog/${postId}`, method: "PATCH" },
    delete: { href: `${API_ADMIN_PREFIX}/blog/${postId}`, method: "DELETE" },
    list: { href: `${API_ADMIN_PREFIX}/blog`, method: "GET" },
  };
}

export function blogPostPublicLinks(id: string | number): Links {
  const postId = String(id);
  return {
    self: { href: `${API_PUBLIC_PREFIX}/blog/by-id/${postId}`, method: "GET" },
    list: { href: `${API_PUBLIC_PREFIX}/blog`, method: "GET" },
  };
}

export function blogPostPublicBySlugLinks(slug: string): Links {
  return {
    self: { href: `${API_PUBLIC_PREFIX}/blog/${encodeURIComponent(slug)}`, method: "GET" },
    list: { href: `${API_PUBLIC_PREFIX}/blog`, method: "GET" },
  };
}

export function blogPostLatestLinks(): Links {
  return {
    self: { href: `${API_PUBLIC_PREFIX}/blog/latest`, method: "GET" },
  };
}

type ListLinksParams = {
  page: number;
  limit: number;
  totalPages: number;
  filters?: Record<string, string | number | boolean | undefined>;
  sort?: { by?: string; dir?: SortDir };
};

export function blogPostListLinks(params: ListLinksParams): Links {
  const query: Record<string, string | number | boolean | undefined> = {
    limit: params.limit,
    ...(params.filters ?? {}),
  };
  if (params.sort?.by !== undefined) query.sortBy = params.sort.by;
  if (params.sort?.dir !== undefined) query.sortDir = params.sort.dir;

  return buildPaginationLinks({
    basePath: BLOG_ADMIN_BASE,
    page: params.page,
    limit: params.limit,
    totalPages: params.totalPages,
    query,
  });
}

export function blogPostPublicListLinks(params: ListLinksParams): Links {
  const query: Record<string, string | number | boolean | undefined> = {
    limit: params.limit,
    ...(params.filters ?? {}),
  };
  if (params.sort?.by !== undefined) query.sortBy = params.sort.by;
  if (params.sort?.dir !== undefined) query.sortDir = params.sort.dir;

  return buildPaginationLinks({
    basePath: BLOG_PUBLIC_BASE,
    page: params.page,
    limit: params.limit,
    totalPages: params.totalPages,
    query,
  });
}
