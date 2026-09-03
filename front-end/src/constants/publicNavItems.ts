/**
 * Itens do menu público que o admin pode esconder em Configurações.
 * Fonte única: a TopNav renderiza a partir daqui e o card do admin monta os
 * switches a partir da mesma lista.
 *
 * A Home fica de fora de propósito: é a porta de entrada do site (e o destino
 * da logo), esconder não faria sentido.
 */
export const PUBLIC_NAV_ITEMS = [
  { id: "eventos", label: "Eventos", path: "/eventos" },
  { id: "blog", label: "Blog", path: "/blog" },
  { id: "pontos-turisticos", label: "Pontos turísticos", path: "/pontos-turisticos" },
  { id: "cidades", label: "Cidades", path: "/cidades" },
  { id: "hoteis", label: "Hotéis", path: "/hoteis" },
  { id: "sobre", label: "Sobre", path: "/sobre" },
] as const;

export type PublicNavItemId = (typeof PUBLIC_NAV_ITEMS)[number]["id"];

export function isPublicNavItemId(value: unknown): value is PublicNavItemId {
  return (
    typeof value === "string" &&
    PUBLIC_NAV_ITEMS.some((item) => item.id === value)
  );
}
