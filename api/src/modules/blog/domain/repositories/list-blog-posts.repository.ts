import { BlogPostEntity } from "../entities/blog-post.entity";
import { BlogPostStatus } from "../value-objects/blog-post-status";

export type SortDir = "asc" | "desc";

export interface ListBlogPostsFilters {
  titulo?: string;
  status?: BlogPostStatus;
  /** Quando true, restringe sempre a status:"published" independentemente do filtro acima (uso público). */
  onlyPublished?: boolean;
}

export interface ListSort {
  by?: string;
  dir?: SortDir;
}

export interface ListBlogPostsQuery {
  page?: number;
  limit?: number;
  filters?: ListBlogPostsFilters;
  sort?: ListSort;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sort: { by: string; dir: SortDir };
}

export interface ListBlogPostsRepository {
  list(query: ListBlogPostsQuery): Promise<PaginatedResult<BlogPostEntity>>;
}
