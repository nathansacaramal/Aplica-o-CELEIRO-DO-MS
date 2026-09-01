import { BlogPostEntity } from "../../domain/entities/blog-post.entity";
import { FindBlogPostBySlugRepository } from "../../domain/repositories/find-blog-post-by-slug.repository";

export class FindBlogPostBySlugUseCase {
  constructor(private readonly repo: FindBlogPostBySlugRepository) {}

  async execute(slug: string): Promise<BlogPostEntity | null> {
    return await this.repo.publicFindBySlug(slug);
  }
}
