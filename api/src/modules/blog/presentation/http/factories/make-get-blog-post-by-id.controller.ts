import { GetBlogPostByIdUseCase } from "@/modules/blog/application/use-cases/get-blog-post-by-id.usecase";
import { SequelizeBlogPostRepository } from "@/modules/blog/infra/repositories/sequelize-blog-post.repository";
import {
  GetBlogPostByIdAudience,
  GetBlogPostByIdController,
} from "../controllers/get-blog-post-by-id.controller";

export function makeGetBlogPostByIdController(audience: GetBlogPostByIdAudience = "admin") {
  const repo = new SequelizeBlogPostRepository();
  const useCase = new GetBlogPostByIdUseCase(repo);
  return new GetBlogPostByIdController(useCase, audience);
}
