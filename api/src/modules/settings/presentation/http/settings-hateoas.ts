import { Links } from "@/core/http/http-resource";

const API_ADMIN_PREFIX = "/api/admin";
const API_PUBLIC_PREFIX = "/api/public";

export const adminSettingsCollectionLinks = (): Links => ({
  self: {
    href: `${API_ADMIN_PREFIX}/settings`,
    method: "GET",
  },
});

export const adminSettingLinks = (key: string): Links => ({
  self: {
    href: `${API_ADMIN_PREFIX}/settings/${encodeURIComponent(key)}`,
    method: "GET",
  },
  update: {
    href: `${API_ADMIN_PREFIX}/settings/${encodeURIComponent(key)}`,
    method: "PATCH",
  },
  list: {
    href: `${API_ADMIN_PREFIX}/settings`,
    method: "GET",
  },
});

export const publicMaintenanceModeLinks = (): Links => ({
  self: {
    href: `${API_PUBLIC_PREFIX}/settings/maintenance-mode`,
    method: "GET",
  },
});

export const publicSiteLogoLinks = (): Links => ({
  self: {
    href: `${API_PUBLIC_PREFIX}/settings/logo`,
    method: "GET",
  },
});

export const publicNavLinks = (): Links => ({
  self: {
    href: `${API_PUBLIC_PREFIX}/settings/nav`,
    method: "GET",
  },
});
