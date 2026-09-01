import { BlogPostsListAudience, ListBlogPostsController } from "../controllers/list-blog-posts.controller";
import { ListBlogPostsUseCase } from "@/modules/blog/application/use-cases/list-blog-posts.usecase";
import { SequelizeBlogPostRepository } from "@/modules/blog/infra/repositories/sequelize-blog-post.repository";

export function makeListBlogPostsController(audience: BlogPostsListAudience = "admin") {
  const repo = new SequelizeBlogPostRepository();
  const useCase = new ListBlogPostsUseCase(repo);
  return new ListBlogPostsController(useCase, audience);
}
