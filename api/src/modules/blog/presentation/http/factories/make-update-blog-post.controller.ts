import { UpdateBlogPostUseCase } from "@/modules/blog/application/use-cases/update-blog-post.usecase";
import { SequelizeBlogPostRepository } from "@/modules/blog/infra/repositories/sequelize-blog-post.repository";
import { getPublicWebImageUploader } from "@/modules/media/infra/factories/compose-public-web-image-uploader";
import { UpdateBlogPostController } from "../controllers/update-blog-post.controller";

export function makeUpdateBlogPostController() {
  const repo = new SequelizeBlogPostRepository();
  const images = getPublicWebImageUploader();
  const useCase = new UpdateBlogPostUseCase(repo, repo, images);
  return new UpdateBlogPostController(useCase);
}
