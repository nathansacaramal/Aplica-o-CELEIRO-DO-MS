import { Links } from "@/core/http/http-resource";

const API_ADMIN_PREFIX = "/api/admin";

export const homeHighlightLinks = (id?: number): Links => ({
  self: {
    href: `${API_ADMIN_PREFIX}/home-highlights/${id}`,
    method: "GET",
  },
  update: {
    href: `${API_ADMIN_PREFIX}/home-highlights/${id}`,
    method: "PATCH",
  },
  delete: {
    href: `${API_ADMIN_PREFIX}/home-highlights/${id}`,
    method: "DELETE",
  },
  list: {
    href: `${API_ADMIN_PREFIX}/home-highlights`,
    method: "GET",
  },
});

export const homeHighlightsCollectionLinks = (): Links => ({
  self: {
    href: `${API_ADMIN_PREFIX}/home-highlights`,
    method: "GET",
  },
  create: {
    href: `${API_ADMIN_PREFIX}/home-highlights`,
    method: "POST",
  },
});
