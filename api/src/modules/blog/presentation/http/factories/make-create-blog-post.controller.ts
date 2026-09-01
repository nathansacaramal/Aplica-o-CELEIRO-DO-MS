import { NoopDomainLogger } from "@/core/logger/domain-logger";
import { CreateBlogPostUseCase } from "@/modules/blog/application/use-cases/create-blog-post.usecase";
import { GenerateUniqueBlogSlugService } from "@/modules/blog/application/services/generate-unique-blog-slug.service";
import { SequelizeBlogPostRepository } from "@/modules/blog/infra/repositories/sequelize-blog-post.repository";
import { getPublicWebImageUploader } from "@/modules/media/infra/factories/compose-public-web-image-uploader";
import { CreateBlogPostController } from "../controllers/create-blog-post.controller";

export function makeCreateBlogPostController() {
  const repo = new SequelizeBlogPostRepository();
  const generateSlug = new GenerateUniqueBlogSlugService(repo);
  const images = getPublicWebImageUploader();
  const usecase = new CreateBlogPostUseCase(repo, generateSlug, images, new NoopDomainLogger());
  return new CreateBlogPostController(usecase);
}
