import { BlogPostEntity } from "../entities/blog-post.entity";

/** Usado apenas para checar unicidade de slug (rascunho ou publicado) ao gerar o slug no create. */
export interface FindBlogPostBySlugAnyStatusRepository {
  findBySlugAnyStatus(slug: string): Promise<BlogPostEntity | null>;
}
