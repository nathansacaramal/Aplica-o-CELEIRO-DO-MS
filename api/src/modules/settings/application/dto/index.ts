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

export const PUBLIC_NAV_KEY = "public_nav";

/**
 * Itens do menu público que podem ser escondidos pelo admin. A Home fica de fora
 * de propósito: é a porta de entrada do site (e o destino da logo), esconder não
 * faria sentido. Novos itens entram aqui e nascem visíveis por padrão.
 */
export const PUBLIC_NAV_ITEM_IDS = [
  "eventos",
  "blog",
  "pontos-turisticos",
  "cidades",
  "hoteis",
  "sobre",
] as const;

export type PublicNavItemId = (typeof PUBLIC_NAV_ITEM_IDS)[number];

/**
 * Guarda o que está escondido (e não o que está visível) para que qualquer
 * problema — chave ausente, valor malformado, item novo ainda não configurado —
 * resulte em menu completo em vez de menu vazio.
 */
export interface PublicNavValue {
  hidden: PublicNavItemId[];
}

export function isPublicNavItemId(value: unknown): value is PublicNavItemId {
  return typeof value === "string" && (PUBLIC_NAV_ITEM_IDS as readonly string[]).includes(value);
}
