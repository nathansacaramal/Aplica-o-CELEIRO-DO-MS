import { Links } from "@/core/http/http-resource";

const API_PREFIX = "/api/auth";

export const loginLinks = (): Links => ({
  self: {
    href: `${API_PREFIX}/login`,
    method: "POST",
  },
  refreshToken: {
    href: `${API_PREFIX}/refresh-token`,
    method: "POST",
  },
  me: {
    href: `${API_PREFIX}/users/me`,
    method: "GET",
  },
});

export const refreshTokenLinks = (): Links => ({
  self: {
    href: `${API_PREFIX}/refresh-token`,
    method: "POST",
  },
  login: {
    href: `${API_PREFIX}/login`,
    method: "POST",
  },
});
