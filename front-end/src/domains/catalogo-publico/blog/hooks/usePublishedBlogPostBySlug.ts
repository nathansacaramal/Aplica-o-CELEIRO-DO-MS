import { useEffect, useState } from "react";
import type { IBlogPost } from "@/entities/blog-post/blogPost.types";
import { toApiError } from "@/services/api/apiError";
import { publicApiClient } from "@/services/public-api/client";

export interface IUsePublishedBlogPostBySlugResult {
  post: IBlogPost | null;
  isLoading: boolean;
  notFound: boolean;
  error: string | null;
}

export function usePublishedBlogPostBySlug(
  slug: string | undefined,
): IUsePublishedBlogPostBySlugResult {
  const [post, setPost] = useState<IBlogPost | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(slug));
  const [notFound, setNotFound] = useState<boolean>(!slug);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadPost(): Promise<void> {
      if (!slug) {
        setPost(null);
        setError(null);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setNotFound(false);
        setPost(null);

        const response = await publicApiClient.getPublishedBlogPostBySlug(slug);

        if (!isActive) return;

        if (!response) {
          setNotFound(true);
          return;
        }

        setPost(response);
      } catch (caught) {
        if (!isActive) return;
        setError(toApiError(caught).message);
        setNotFound(false);
        setPost(null);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadPost();

    return () => {
      isActive = false;
    };
  }, [slug]);

  return { post, isLoading, notFound, error };
}
