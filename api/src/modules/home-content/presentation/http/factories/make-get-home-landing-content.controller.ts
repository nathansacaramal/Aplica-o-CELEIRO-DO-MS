import { GetHomeLandingContentUseCase } from "@/modules/home-content/application/use-cases/get-home-landing-content.usecase";
import { SequelizeHomeHighlightRepository } from "@/modules/home-highlights/infra/sequelize/sequelize-home-highlight.repository";
import { GetHomeLandingContentController } from "../controllers/get-home-landing-content.controller";

export function makeGetHomeLandingContentController() {
  const highlightRepo = new SequelizeHomeHighlightRepository();
  const usecase = new GetHomeLandingContentUseCase(highlightRepo);
  return new GetHomeLandingContentController(usecase);
}
