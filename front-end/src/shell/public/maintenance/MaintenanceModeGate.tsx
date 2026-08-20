import type { ReactElement } from "react";
import { PublicLayout } from "@/shell/public/layouts/PublicLayout";
import { useMaintenanceMode } from "@/domains/public-portal/settings/hooks/useMaintenanceMode";
import { MaintenancePage } from "./MaintenancePage";

/**
 * Envolve as rotas públicas: renderiza o site normalmente por padrão (e
 * durante o carregamento da checagem) e só troca para a página de
 * manutenção depois de confirmar que o modo está ativado. Isso evita
 * atrasar/mudar o carregamento normal do site na imensa maioria dos
 * acessos, em que a manutenção está desativada.
 */
export function MaintenanceModeGate(): ReactElement {
  const { enabled } = useMaintenanceMode();

  if (enabled) {
    return <MaintenancePage />;
  }

  return <PublicLayout />;
}
