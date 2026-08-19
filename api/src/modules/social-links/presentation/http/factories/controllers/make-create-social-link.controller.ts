import { CreateSocialLinkUseCase } from "@/modules/social-links/application/use-cases/create-social-link.usecase";
import { SequelizeSocialLinkRepository } from "@/modules/social-links/infra/sequelize/sequelize-social-link.repository";
import { CreateSocialLinkController } from "../../controllers/create-social-link.controller";

export function makeCreateSocialLinkController() {
  const repo = new SequelizeSocialLinkRepository();
  const useCase = new CreateSocialLinkUseCase(repo);
  return new CreateSocialLinkController(useCase);
}
