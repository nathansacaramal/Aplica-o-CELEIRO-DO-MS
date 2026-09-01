import { BlogPostEntity } from "../entities/blog-post.entity";

export interface FindBlogPostBySlugRepository {
  publicFindBySlug(slug: string): Promise<BlogPostEntity | null>;
}
