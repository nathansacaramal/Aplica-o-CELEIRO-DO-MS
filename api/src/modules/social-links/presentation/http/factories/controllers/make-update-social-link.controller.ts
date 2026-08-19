import { UpdateSocialLinkUseCase } from "@/modules/social-links/application/use-cases/update-social-link.usecase";
import { SequelizeSocialLinkRepository } from "@/modules/social-links/infra/sequelize/sequelize-social-link.repository";
import { UpdateSocialLinkController } from "../../controllers/update-social-link.controller";

export function makeUpdateSocialLinkController() {
  const repo = new SequelizeSocialLinkRepository();
  const useCase = new UpdateSocialLinkUseCase(repo, repo);
  return new UpdateSocialLinkController(useCase);
}
