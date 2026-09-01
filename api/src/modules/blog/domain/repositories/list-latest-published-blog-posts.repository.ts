import { BlogPostEntity } from "../entities/blog-post.entity";

/** Query fixa e barata usada pela seção "Últimas publicações" da home — sem paginação. */
export interface ListLatestPublishedBlogPostsRepository {
  listLatestPublished(limit: number): Promise<BlogPostEntity[]>;
}
