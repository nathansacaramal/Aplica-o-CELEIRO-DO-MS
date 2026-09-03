import type { PublicNavItemId } from "@/constants/publicNavItems";

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

/**
 * Guarda o que está escondido (e não o que está visível): qualquer problema —
 * chave ausente, valor malformado, item novo ainda não configurado — resulta em
 * menu completo em vez de menu vazio.
 */
export interface IPublicNavValue {
  hidden: PublicNavItemId[];
}

export const PUBLIC_NAV_KEY = "public_nav";

/** Menu completo: nenhum item escondido. */
export const DEFAULT_PUBLIC_NAV_VALUE: IPublicNavValue = { hidden: [] };
