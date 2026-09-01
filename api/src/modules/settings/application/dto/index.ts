export interface UpdateSettingDTO {
  value: unknown;
}

export interface MaintenanceModeValue {
  enabled: boolean;
}

export const SITE_LOGO_KEY = "site_logo";

/** Logo atual do site (front-end público) enquanto nenhuma configuração foi salva. */
export const DEFAULT_SITE_LOGO_URL = "/celeiro_ms_logo.jpg";

export interface SiteLogoValue {
  url: string;
}
