import { useEffect, useState } from "react";
import {
  PUBLIC_NAV_ITEMS,
  type PublicNavItemId,
} from "@/constants/publicNavItems";
import { getOrCreateSessionPromise } from "@/domains/public-portal/cache/sessionFetchCache";
import { publicApiClient } from "@/services/public-api/client";

type PublicNavItem = (typeof PUBLIC_NAV_ITEMS)[number];

interface IUsePublicNavResult {
  items: readonly PublicNavItem[];
}

const CACHE_KEY = "public:nav";

/**
 * Começa com o menu completo e só esconde itens depois de confirmar a
 * configuração salva — em caso de falha na consulta o menu permanece completo,
 * nunca vazio por causa dessa checagem.
 */
export function usePublicNav(): IUsePublicNavResult {
  const [hidden, setHidden] = useState<PublicNavItemId[]>([]);

  useEffect(() => {
    let isActive: boolean = true;

    async function loadPublicNav(): Promise<void> {
      try {
        const response = await getOrCreateSessionPromise(CACHE_KEY, () =>
          publicApiClient.getPublicNav(),
        );

        if (!isActive) {
          return;
        }

        setHidden(response.hidden);
      } catch {
        // já resolvido para o menu completo; nada a fazer aqui.
      }
    }

    void loadPublicNav();

    return () => {
      isActive = false;
    };
  }, []);

  const items = PUBLIC_NAV_ITEMS.filter((item) => !hidden.includes(item.id));

  return { items };
}
