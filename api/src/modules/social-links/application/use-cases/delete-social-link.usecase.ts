import { logger } from "@/core/config/logger";
import { DeleteSocialLinkRepository } from "../../domain/repositories/delete-social-link.repository";
import { FindSocialLinkByIdRepository } from "../../domain/repositories/find-social-link-by-id.repository";

export class DeleteSocialLinkUseCase {
  constructor(
    private readonly findByIdRepo: FindSocialLinkByIdRepository,
    private readonly deleteRepo: DeleteSocialLinkRepository,
  ) {}

  async execute(id: number): Promise<boolean> {
    const existing = await this.findByIdRepo.findById(id);

    if (!existing) {
      logger.info("DeleteSocialLinkUseCase: social link não encontrado", { id });
      return false;
    }

    const deleted = await this.deleteRepo.delete(id);
    logger.info("DeleteSocialLinkUseCase: social link deletado", { id, deleted });
    return deleted;
  }
}
