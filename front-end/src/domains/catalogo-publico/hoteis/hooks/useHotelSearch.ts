import type { ICity } from "@/entities/city/city.types";
import type { IHotelSearchResult } from "@/entities/hotel/hotel.types";
import { normalizeBffApiRootUrl } from "@/services/api/bffBaseUrlNormalize";
import { searchHotelsByCity } from "@/services/hotels/hotelSearch.api";
import { useCallback, useEffect, useRef, useState } from "react";

function resolveBffBaseUrl(): string {
  const raw: string | undefined = import.meta.env.VITE_PUBLIC_BFF_BASE_URL;
  return normalizeBffApiRootUrl(typeof raw === "string" ? raw.trim() : "");
}

export interface IUseHotelSearchResult {
  isLoading: boolean;
  error: string;
  hasSearched: boolean;
  result: IHotelSearchResult | null;
  search: (city: ICity) => void;
}

export function useHotelSearch(): IUseHotelSearchResult {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [result, setResult] = useState<IHotelSearchResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const search = useCallback((city: ICity): void => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setHasSearched(true);
    setIsLoading(true);
    setError("");

    searchHotelsByCity(resolveBffBaseUrl(), city.name, city.state, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }
        setResult(data);
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setResult(null);
        setError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível buscar os hotéis. Tente novamente.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });
  }, []);

  return { isLoading, error, hasSearched, result, search };
}
