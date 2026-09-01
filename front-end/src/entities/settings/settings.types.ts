/** Registro genérico de configuração (chave/valor), extensível a novas chaves sem mudança de schema. */
export interface ISiteSetting {
  id: number;
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface IMaintenanceModeValue {
  enabled: boolean;
}

export interface ISiteLogoValue {
  url: string;
}

/** Logo estática atual do site (public/celeiro_ms_logo.jpg), usada como fallback. */
export const DEFAULT_SITE_LOGO_URL = "/celeiro_ms_logo.jpg";
