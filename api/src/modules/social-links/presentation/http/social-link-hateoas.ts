import { Links } from "@/core/http/http-resource";

const API_ADMIN = "/api/admin";
const API_PUBLIC = "/api/public";

export function socialLinkAdminLinks(id: number): Links {
  const sid = String(id);
  return {
    self: { href: `${API_ADMIN}/social-links/${sid}`, method: "GET" },
    update: { href: `${API_ADMIN}/social-links/${sid}`, method: "PATCH" },
    delete: { href: `${API_ADMIN}/social-links/${sid}`, method: "DELETE" },
    list: { href: `${API_ADMIN}/social-links`, method: "GET" },
  };
}

export function socialLinkPublicLinks(id: number): Links {
  const sid = String(id);
  return {
    self: { href: `${API_PUBLIC}/social-links/${sid}`, method: "GET" },
    list: { href: `${API_PUBLIC}/social-links`, method: "GET" },
  };
}

export function socialLinksAdminCollectionLinks(): Links {
  return {
    self: { href: `${API_ADMIN}/social-links`, method: "GET" },
    create: { href: `${API_ADMIN}/social-links`, method: "POST" },
  };
}

export function socialLinksPublicCollectionLinks(): Links {
  return {
    self: { href: `${API_PUBLIC}/social-links`, method: "GET" },
  };
}
