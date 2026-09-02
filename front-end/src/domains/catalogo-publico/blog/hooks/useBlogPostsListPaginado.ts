import { useCallback, useEffect, useRef, useState } from "react";
import type { IBlogPost } from "@/entities/blog-post/blogPost.types";
import { toApiError } from "@/services/api/apiError";
import { publicApiClient } from "@/services/public-api/client";
import { isRequestAborted } from "@/domains/catalogo-publico/shared/utils/isRequestAborted";

const PAGE_LIMIT = 12;

interface IState {
  items: IBlogPost[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface IUseBlogPostsListPaginadoResult {
  data: IState;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
}

const INITIAL_STATE: IState = { items: [], total: 0, page: 1, hasMore: false };

/** Paginação "carregar mais" para a página `/blog` — sem escopo por cidade (diferente do catálogo de eventos/pontos). */
export function useBlogPostsListPaginado(): IUseBlogPostsListPaginadoResult {
  const [data, setData] = useState<IState>(INITIAL_STATE);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<IState>(INITIAL_STATE);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();

    async function load(): Promise<void> {
      try {
        setIsInitialLoading(true);
        setError(null);

        const response = await publicApiClient.listPublishedBlogPosts({
          page: 1,
          limit: PAGE_LIMIT,
          signal: abortController.signal,
        });

        if (!isActive) return;

        setData({
          items: response.items,
          total: response.total,
          page: response.page,
          hasMore: response.items.length < response.total,
        });
      } catch (caught) {
        if (!isActive || isRequestAborted(caught)) return;
        setError(toApiError(caught).message);
      } finally {
        if (isActive) setIsInitialLoading(false);
      }
    }

    void load();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, []);

  const loadMore = useCallback(async (): Promise<void> => {
    const current = dataRef.current;
    if (isLoadingMore || isInitialLoading || !current.hasMore) return;

    try {
      setIsLoadingMore(true);
      setError(null);

      const nextPage = current.page + 1;
      const response = await publicApiClient.listPublishedBlogPosts({
        page: nextPage,
        limit: PAGE_LIMIT,
      });

      setData((prev) => {
        const items = [...prev.items, ...response.items];
        return {
          items,
          total: response.total,
          page: response.page,
          hasMore: items.length < response.total,
        };
      });
    } catch (caught) {
      if (!isRequestAborted(caught)) {
        setError(toApiError(caught).message);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [isInitialLoading, isLoadingMore]);

  return { data, isInitialLoading, isLoadingMore, error, loadMore };
}
