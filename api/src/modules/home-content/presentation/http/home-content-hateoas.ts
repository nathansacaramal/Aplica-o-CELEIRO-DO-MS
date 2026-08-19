import { Links } from "@/core/http/http-resource";

const API_PUBLIC = "/api/public";

export function homeLandingContentLinks(): Links {
  return {
    self: { href: `${API_PUBLIC}/home-content`, method: "GET" },
  };
}
