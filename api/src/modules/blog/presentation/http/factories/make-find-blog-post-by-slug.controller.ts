import { FindBlogPostBySlugUseCase } from "@/modules/blog/application/use-cases/find-blog-post-by-slug.usecase";
import { SequelizeBlogPostRepository } from "@/modules/blog/infra/repositories/sequelize-blog-post.repository";
import { FindBlogPostBySlugController } from "../controllers/find-blog-post-by-slug.controller";

export function makeFindBlogPostBySlugController() {
  const repo = new SequelizeBlogPostRepository();
  const useCase = new FindBlogPostBySlugUseCase(repo);
  return new FindBlogPostBySlugController(useCase);
}
