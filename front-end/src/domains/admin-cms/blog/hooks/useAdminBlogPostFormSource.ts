import { useEffect, useState } from "react";
import type { IBlogPost } from "@/entities/blog-post/blogPost.types";
import { toApiError } from "@/services/api/apiError";
import { getAdminBlogPostById } from "@/services/admin-api/adminBlogPosts.api";

export interface IUseAdminBlogPostFormSourceResult {
  /** Em modo edição, a publicação carregada; em criação, `null` após o load. */
  post: IBlogPost | null;
  isLoading: boolean;
  error: string;
  notFound: boolean;
}

export function useAdminBlogPostFormSource(
  postId: number | undefined,
): IUseAdminBlogPostFormSourceResult {
  const [post, setPost] = useState<IBlogPost | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(postId));
  const [error, setError] = useState<string>("");
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    let isActive = true;

    async function loadData(): Promise<void> {
      if (!postId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        setNotFound(false);
        setPost(null);

        const response = await getAdminBlogPostById(postId);

        if (!isActive) return;

        if (!response) {
          setNotFound(true);
          return;
        }

        setPost(response);
      } catch (caught) {
        if (!isActive) return;
        setError(toApiError(caught).message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isActive = false;
    };
  }, [postId]);

  return { post, isLoading, error, notFound };
}
