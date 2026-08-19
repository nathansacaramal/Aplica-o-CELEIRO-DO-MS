import { Links } from "@/core/http";

const API_ADMIN = "/api/admin";
const API_PUBLIC = "/api/public";

export const institutionalContentLinks = (id?: number): Links => ({
  self: {
    href: `${API_ADMIN}/institutional-content/${id}`,
    method: "GET",
  },
  update: {
    href: `${API_ADMIN}/institutional-content/${id}`,
    method: "PATCH",
  },
  delete: {
    href: `${API_ADMIN}/institutional-content/${id}`,
    method: "DELETE",
  },
  list: {
    href: `${API_ADMIN}/institutional-content`,
    method: "GET",
  },
});

export const institutionalContentCollectionLinks = (): Links => ({
  self: {
    href: `${API_ADMIN}/institutional-content`,
    method: "GET",
  },
  create: {
    href: `${API_ADMIN}/institutional-content`,
    method: "POST",
  },
});

export const institutionalContentPublicLinks = (id: number): Links => ({
  self: {
    href: `${API_PUBLIC}/institutional-content/${id}`,
    method: "GET",
  },
  list: {
    href: `${API_PUBLIC}/institutional-content`,
    method: "GET",
  },
});

export const institutionalContentPublicCollectionLinks = (): Links => ({
  self: {
    href: `${API_PUBLIC}/institutional-content`,
    method: "GET",
  },
});
