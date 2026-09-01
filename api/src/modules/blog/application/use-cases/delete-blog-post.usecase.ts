import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import { FindBlogPostByIdRepository } from "../../domain/repositories/find-blog-post-by-id.repository";
import { DeleteBlogPostRepository } from "../../domain/repositories/delete-blog-post.repository";

export class DeleteBlogPostUseCase {
  constructor(
    private readonly findByIdRepo: FindBlogPostByIdRepository,
    private readonly deleteRepo: DeleteBlogPostRepository,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute({ id }: { id: number }): Promise<boolean> {
    const existing = await this.findByIdRepo.findById(id);
    if (!existing) return false;

    const deleted = await this.deleteRepo.delete(id);

    this.logger.info("DeleteBlogPostUseCase:done", { id, deleted });
    return deleted;
  }
}
