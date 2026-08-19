import { Links } from "@/core/http/http-resource";

const API_ADMIN_PREFIX = "/api/admin";
const API_PUBLIC_PREFIX = "/api/public";

export const adminCityLinks = (id?: number): Links => ({
  self: {
    href: `${API_ADMIN_PREFIX}/cities/${id}`,
    method: "GET",
  },
  update: {
    href: `${API_ADMIN_PREFIX}/cities/${id}`,
    method: "PATCH",
  },
  delete: {
    href: `${API_ADMIN_PREFIX}/cities/${id}`,
    method: "DELETE",
  },
  list: {
    href: `${API_ADMIN_PREFIX}/cities`,
    method: "GET",
  },
});

export const adminCitiesCollectionLinks = (): Links => ({
  self: {
    href: `${API_ADMIN_PREFIX}/cities`,
    method: "GET",
  },
  create: {
    href: `${API_ADMIN_PREFIX}/cities`,
    method: "POST",
  },
});

export const publicCitiesCollectionLinks = (): Links => ({
  self: {
    href: `${API_PUBLIC_PREFIX}/cities`,
    method: "GET",
  },
});

export const publicCityBySlugLinks = (slug: string): Links => ({
  self: {
    href: `${API_PUBLIC_PREFIX}/cities/${encodeURIComponent(slug)}`,
    method: "GET",
  },
  list: {
    href: `${API_PUBLIC_PREFIX}/cities`,
    method: "GET",
  },
});

export const publicCityByIdLinks = (id: number): Links => ({
  self: {
    href: `${API_PUBLIC_PREFIX}/cities/by-id/${id}`,
    method: "GET",
  },
  list: {
    href: `${API_PUBLIC_PREFIX}/cities`,
    method: "GET",
  },
});
