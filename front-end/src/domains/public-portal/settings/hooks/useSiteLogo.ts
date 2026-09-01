import { useEffect, useState } from "react";
import { DEFAULT_SITE_LOGO_URL } from "@/entities/settings/settings.types";
import { getOrCreateSessionPromise } from "@/domains/public-portal/cache/sessionFetchCache";
import { publicApiClient } from "@/services/public-api/client";

interface IUseSiteLogoResult {
  url: string;
}

const CACHE_KEY = "public:site-logo";

/**
 * Começa com a logo estática atual e só troca depois de confirmar a
 * configuração salva — e também em caso de falha na consulta, o site nunca
 * fica sem logo por causa dessa checagem.
 */
export function useSiteLogo(): IUseSiteLogoResult {
  const [url, setUrl] = useState<string>(DEFAULT_SITE_LOGO_URL);

  useEffect(() => {
    let isActive: boolean = true;

    async function loadSiteLogo(): Promise<void> {
      try {
        const response = await getOrCreateSessionPromise(CACHE_KEY, () =>
          publicApiClient.getSiteLogo(),
        );

        if (!isActive) {
          return;
        }

        setUrl(response.url);
      } catch {
        // já resolvido para a logo padrão; nada a fazer aqui.
      }
    }

    void loadSiteLogo();

    return () => {
      isActive = false;
    };
  }, []);

  return { url };
}
