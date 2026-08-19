import { logger } from "@/core/config/logger";
import { SocialLinkEntity } from "../../domain/entities/social-link.entity";
import { FindSocialLinkByIdRepository } from "../../domain/repositories/find-social-link-by-id.repository";
import { UpdateSocialLinkRepository } from "../../domain/repositories/update-social-link.repository";
import { UpdateSocialLinkDTO } from "../dto";

export class UpdateSocialLinkUseCase {
  constructor(
    private readonly findByIdRepo: FindSocialLinkByIdRepository,
    private readonly updateRepo: UpdateSocialLinkRepository,
  ) {}

  async execute(id: number, input: UpdateSocialLinkDTO): Promise<SocialLinkEntity | null> {
    const existing = await this.findByIdRepo.findById(id);

    if (!existing) {
      logger.info("UpdateSocialLinkUseCase: social link não encontrado", { id });
      return null;
    }

    const entity = new SocialLinkEntity({
      id,
      platform: input.platform ?? existing.platform,
      label: input.label ?? existing.label,
      url: input.url ?? existing.url,
      active: input.active ?? existing.active,
      order: input.order ?? existing.order,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    const updated = await this.updateRepo.update(id, entity);

    if (updated) {
      logger.info("UpdateSocialLinkUseCase: social link atualizado", { id });
    }

    return updated;
  }
}
