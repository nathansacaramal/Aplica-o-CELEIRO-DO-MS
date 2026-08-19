import { DeleteSocialLinkUseCase } from "@/modules/social-links/application/use-cases/delete-social-link.usecase";
import { SequelizeSocialLinkRepository } from "@/modules/social-links/infra/sequelize/sequelize-social-link.repository";
import { DeleteSocialLinkController } from "../../controllers/delete-social-link.controller";

export function makeDeleteSocialLinkController() {
  const repo = new SequelizeSocialLinkRepository();
  const useCase = new DeleteSocialLinkUseCase(repo, repo);
  return new DeleteSocialLinkController(useCase);
}
