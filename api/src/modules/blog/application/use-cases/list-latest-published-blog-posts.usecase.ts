import { BlogPostEntity } from "../../domain/entities/blog-post.entity";
import { ListLatestPublishedBlogPostsRepository } from "../../domain/repositories/list-latest-published-blog-posts.repository";

const HOME_SECTION_LIMIT = 12;

export class ListLatestPublishedBlogPostsUseCase {
  constructor(private readonly repo: ListLatestPublishedBlogPostsRepository) {}

  async execute(limit: number = HOME_SECTION_LIMIT): Promise<BlogPostEntity[]> {
    const safeLimit = Math.min(HOME_SECTION_LIMIT, Math.max(1, limit));
    return await this.repo.listLatestPublished(safeLimit);
  }
}
