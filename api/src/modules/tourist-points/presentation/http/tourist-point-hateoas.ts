import { Links } from "@/core/http";

const API_ADMIN = "/api/admin";
const API_PUBLIC = "/api/public";

export function touristPointLinks(id: number): Links {
  return {
    self: { href: `${API_ADMIN}/tourist-points/${id}`, method: "GET" },
    update: { href: `${API_ADMIN}/tourist-points/${id}`, method: "PUT" },
    delete: { href: `${API_ADMIN}/tourist-points/${id}`, method: "DELETE" },
    list: { href: `${API_ADMIN}/tourist-points`, method: "GET" },
    create: { href: `${API_ADMIN}/tourist-points`, method: "POST" },
  };
}

export function touristPointPublicLinks(id: number): Links {
  return {
    self: { href: `${API_PUBLIC}/tourist-points/${id}`, method: "GET" },
    list: { href: `${API_PUBLIC}/tourist-points`, method: "GET" },
  };
}

export const touristPointsCollectionLinks = (): Links => ({
  self: {
    href: `${API_ADMIN}/tourist-points`,
    method: "GET",
  },
  create: {
    href: `${API_ADMIN}/tourist-points`,
    method: "POST",
  },
});

export const touristPointsPublicCollectionLinks = (): Links => ({
  self: {
    href: `${API_PUBLIC}/tourist-points`,
    method: "GET",
  },
});
