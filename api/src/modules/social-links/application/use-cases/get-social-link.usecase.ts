import { logger } from "@/core/config/logger";
import { SocialLinkEntity } from "../../domain/entities/social-link.entity";
import { GetSocialLinkRepository } from "../../domain/repositories/get-social-link.repository";

export class GetSocialLinkUseCase {
  constructor(private readonly getRepo: GetSocialLinkRepository) {}

  async execute(): Promise<SocialLinkEntity[] | null> {
    const socialLinks = await this.getRepo.getAll();

    if (!socialLinks?.length) {
      logger.info("GetSocialLinkUseCase: nenhum social link encontrado");
      return socialLinks;
    }

    logger.debug("GetSocialLinkUseCase: social links listados", {
      total: socialLinks.length,
    });

    return socialLinks;
  }
}
