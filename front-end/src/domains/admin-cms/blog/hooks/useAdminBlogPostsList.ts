import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { IBlogPost } from "@/entities/blog-post/blogPost.types";
import type { BlogPostStatus } from "@/entities/blog-post/blogPost.types";
import { toApiError } from "@/services/api/apiError";
import { listAdminBlogPosts } from "@/services/admin-api/adminBlogPosts.api";

export interface IUseAdminBlogPostsListResult {
  items: IBlogPost[];
  setItems: Dispatch<SetStateAction<IBlogPost[]>>;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export function useAdminBlogPostsList(
  status?: BlogPostStatus,
  titulo?: string,
): IUseAdminBlogPostsListResult {
  const [items, setItems] = useState<IBlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const reload = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const response = await listAdminBlogPosts({ status, titulo });
      setItems(response);
    } catch (caught) {
      setError(toApiError(caught).message);
    } finally {
      setIsLoading(false);
    }
  }, [status, titulo]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, setItems, isLoading, error, reload };
}
