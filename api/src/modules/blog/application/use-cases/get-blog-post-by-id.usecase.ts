import { AppError } from "@/core/errors-app-error";
import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import { BlogPostEntity } from "../../domain/entities/blog-post.entity";
import { FindBlogPostByIdRepository } from "../../domain/repositories/find-blog-post-by-id.repository";

export class GetBlogPostByIdUseCase {
  constructor(
    private readonly findByIdRepo: FindBlogPostByIdRepository,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute(id: number): Promise<BlogPostEntity> {
    const found = await this.findByIdRepo.findById(id);
    if (!found) {
      throw new AppError({
        code: "BLOG_POST_NOT_FOUND",
        message: `Publicação ${id} não encontrada`,
        statusCode: 404,
        details: { id },
      });
    }
    return found;
  }
}
