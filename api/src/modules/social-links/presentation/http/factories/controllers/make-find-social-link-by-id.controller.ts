import { FindSocialLinkByIdUseCase } from "@/modules/social-links/application/use-cases/find-social-link-by-id.usecase";
import { SequelizeSocialLinkRepository } from "@/modules/social-links/infra/sequelize/sequelize-social-link.repository";
import {
  FindSocialLinkByIdController,
  SocialLinkByIdAudience,
} from "../../controllers/find-social-link-by-id.controller";

export function makeFindSocialLinkByIdController(audience: SocialLinkByIdAudience = "admin") {
  const repo = new SequelizeSocialLinkRepository();
  const useCase = new FindSocialLinkByIdUseCase(repo);
  return new FindSocialLinkByIdController(useCase, audience);
}
