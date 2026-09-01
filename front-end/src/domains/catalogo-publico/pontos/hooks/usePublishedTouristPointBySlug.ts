import { useEffect, useState } from "react";
import type { ITouristPoint } from "@/entities/tourist-point/touristPoint.types";
import { toApiError } from "@/services/api/apiError";
import { publicApiClient } from "@/services/public-api/client";

export interface IUsePublishedTouristPointBySlugResult {
  touristPoint: ITouristPoint | null;
  isLoading: boolean;
  notFound: boolean;
  error: string | null;
}

export function usePublishedTouristPointBySlug(
  slug: string | undefined,
): IUsePublishedTouristPointBySlugResult {
  const [touristPoint, setTouristPoint] = useState<ITouristPoint | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(slug));
  const [notFound, setNotFound] = useState<boolean>(!slug);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive: boolean = true;

    async function load(): Promise<void> {
      if (!slug) {
        setTouristPoint(null);
        setError(null);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setNotFound(false);
        setTouristPoint(null);

        const response: ITouristPoint | null =
          await publicApiClient.getPublishedTouristPointBySlug(slug);

        if (!isActive) {
          return;
        }

        if (!response) {
          setNotFound(true);
          return;
        }

        setTouristPoint(response);
      } catch (caught) {
        if (!isActive) {
          return;
        }
        setError(toApiError(caught).message);
        setNotFound(false);
        setTouristPoint(null);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [slug]);

  return { touristPoint, isLoading, notFound, error };
}
