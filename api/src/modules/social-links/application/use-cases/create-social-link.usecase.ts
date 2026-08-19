import { logger } from "@/core/config/logger";
import { SocialLinkEntity } from "../../domain/entities/social-link.entity";
import { CreateSocialLinkRepository } from "../../domain/repositories/create-social-link.repository";

export class CreateSocialLinkUseCase {
  constructor(private readonly createRepo: CreateSocialLinkRepository) {}

  async execute(entity: SocialLinkEntity): Promise<SocialLinkEntity | null> {
    const created = await this.createRepo.create(entity);

    if (!created) {
      logger.info("CreateSocialLinkUseCase: falha ao criar social link");
      return null;
    }

    logger.info("CreateSocialLinkUseCase: social link criado", {
      id: created.id,
      platform: created.platform,
    });

    return created;
  }
}
