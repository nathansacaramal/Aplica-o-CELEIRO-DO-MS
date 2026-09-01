import { ListLatestPublishedBlogPostsUseCase } from "@/modules/blog/application/use-cases/list-latest-published-blog-posts.usecase";
import { SequelizeBlogPostRepository } from "@/modules/blog/infra/repositories/sequelize-blog-post.repository";
import { ListLatestPublishedBlogPostsController } from "../controllers/list-latest-published-blog-posts.controller";

export function makeListLatestPublishedBlogPostsController() {
  const repo = new SequelizeBlogPostRepository();
  const useCase = new ListLatestPublishedBlogPostsUseCase(repo);
  return new ListLatestPublishedBlogPostsController(useCase);
}
