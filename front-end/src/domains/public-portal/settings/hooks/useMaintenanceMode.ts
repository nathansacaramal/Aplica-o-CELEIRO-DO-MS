import { useEffect, useState } from "react";
import { getOrCreateSessionPromise } from "@/domains/public-portal/cache/sessionFetchCache";
import { publicApiClient } from "@/services/public-api/client";

interface IUseMaintenanceModeResult {
  enabled: boolean;
}

const CACHE_KEY = "public:maintenance-mode";

/**
 * Nunca bloqueia a renderização: assume `enabled: false` (site público) até
 * a checagem terminar e também em caso de falha na consulta, para que o
 * funcionamento normal do site nunca dependa dessa checagem.
 */
export function useMaintenanceMode(): IUseMaintenanceModeResult {
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    let isActive: boolean = true;

    async function loadMaintenanceMode(): Promise<void> {
      try {
        const response = await getOrCreateSessionPromise(CACHE_KEY, () =>
          publicApiClient.getMaintenanceMode(),
        );

        if (!isActive) {
          return;
        }

        setEnabled(response.enabled);
      } catch {
        // já resolvido para `false` por padrão; nada a fazer aqui.
      }
    }

    void loadMaintenanceMode();

    return () => {
      isActive = false;
    };
  }, []);

  return { enabled };
}
