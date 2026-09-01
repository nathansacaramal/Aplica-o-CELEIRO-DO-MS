import { useEffect, useState } from "react";
import type { IEvent } from "@/entities/event/event.types";
import { toApiError } from "@/services/api/apiError";
import { publicApiClient } from "@/services/public-api/client";

export interface IUsePublishedEventBySlugResult {
  event: IEvent | null;
  isLoading: boolean;
  notFound: boolean;
  error: string | null;
}

export function usePublishedEventBySlug(
  slug: string | undefined,
): IUsePublishedEventBySlugResult {
  const [event, setEvent] = useState<IEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(slug));
  const [notFound, setNotFound] = useState<boolean>(!slug);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive: boolean = true;

    async function loadEvent(): Promise<void> {
      if (!slug) {
        setEvent(null);
        setError(null);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setNotFound(false);
        setEvent(null);

        const response: IEvent | null =
          await publicApiClient.getPublishedEventBySlug(slug);

        if (!isActive) {
          return;
        }

        if (!response) {
          setNotFound(true);
          return;
        }

        setEvent(response);
      } catch (caught) {
        if (!isActive) {
          return;
        }
        setError(toApiError(caught).message);
        setNotFound(false);
        setEvent(null);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadEvent();

    return () => {
      isActive = false;
    };
  }, [slug]);

  return { event, isLoading, notFound, error };
}
