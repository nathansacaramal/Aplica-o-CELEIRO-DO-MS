import { GetSocialLinkUseCase } from "@/modules/social-links/application/use-cases/get-social-link.usecase";
import { SequelizeSocialLinkRepository } from "@/modules/social-links/infra/sequelize/sequelize-social-link.repository";
import {
  GetSocialLinkController,
  SocialLinkListAudience,
} from "../../controllers/get-social-link.controller";

export function makeGetSocialLinkController(audience: SocialLinkListAudience = "admin") {
  const repo = new SequelizeSocialLinkRepository();
  const useCase = new GetSocialLinkUseCase(repo);
  return new GetSocialLinkController(useCase, audience);
}
