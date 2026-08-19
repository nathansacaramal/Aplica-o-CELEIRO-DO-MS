import { logger } from "@/core/config/logger";
import { SocialLinkEntity } from "../../domain/entities/social-link.entity";
import { FindSocialLinkByIdRepository } from "../../domain/repositories/find-social-link-by-id.repository";

export class FindSocialLinkByIdUseCase {
  constructor(private readonly findByIdRepo: FindSocialLinkByIdRepository) {}

  async execute(id: number): Promise<SocialLinkEntity | null> {
    const socialLink = await this.findByIdRepo.findById(id);

    if (!socialLink) {
      logger.info("FindSocialLinkByIdUseCase: social link não encontrado", {
        id,
      });
      return null;
    }

    logger.debug("FindSocialLinkByIdUseCase: social link encontrado", { id });
    return socialLink;
  }
}
