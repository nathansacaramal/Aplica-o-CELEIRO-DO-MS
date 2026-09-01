import { SequelizeBlogPostRepository } from "@/modules/blog/infra/repositories/sequelize-blog-post.repository";
import { DeleteBlogPostUseCase } from "@/modules/blog/application/use-cases/delete-blog-post.usecase";
import { DeleteBlogPostController } from "../controllers/delete-blog-post.controller";

export function makeDeleteBlogPostController() {
  const repo = new SequelizeBlogPostRepository();
  const useCase = new DeleteBlogPostUseCase(repo, repo);
  return new DeleteBlogPostController(useCase);
}
