import type {
  IBlogPost,
  ICreateBlogPostInput,
  IUpdateBlogPostInput,
} from "@/entities/blog-post/blogPost.types";
import { adminApiClient } from "@/services/admin-api/client";
import type { IAdminBlogPostsListQuery } from "@/services/admin-api/adminApi.types";

/** Listagem administrativa de publicações do blog (delega ao cliente HTTP autenticado). */
export function listAdminBlogPosts(query?: IAdminBlogPostsListQuery): Promise<IBlogPost[]> {
  return adminApiClient.listBlogPosts(query);
}

export function getAdminBlogPostById(id: number): Promise<IBlogPost | null> {
  return adminApiClient.getBlogPostById(id);
}

export function createAdminBlogPost(input: ICreateBlogPostInput): Promise<IBlogPost> {
  return adminApiClient.createBlogPost(input);
}

export function updateAdminBlogPost(input: IUpdateBlogPostInput): Promise<IBlogPost> {
  return adminApiClient.updateBlogPost(input);
}

export function deleteAdminBlogPost(id: number): Promise<void> {
  return adminApiClient.deleteBlogPost(id);
}
