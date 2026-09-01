import { useEffect, useState } from "react";
import type { IBlogPost } from "@/entities/blog-post/blogPost.types";
import { publicApiClient } from "@/services/public-api/client";

const HOME_SECTION_LIMIT = 12;

export interface IUseLatestBlogPostsResult {
  posts: IBlogPost[];
  isLoading: boolean;
}

/** Nunca lança: em caso de falha, `posts` fica vazio (a seção simplesmente não aparece). */
export function useLatestBlogPosts(): IUseLatestBlogPostsResult {
  const [posts, setPosts] = useState<IBlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isActive = true;

    async function load(): Promise<void> {
      const items = await publicApiClient.listLatestPublishedBlogPosts(HOME_SECTION_LIMIT);
      if (!isActive) return;
      setPosts(items);
      setIsLoading(false);
    }

    void load();

    return () => {
      isActive = false;
    };
  }, []);

  return { posts, isLoading };
}
