import { Controller } from "@/core/protocols";
import { GetHomeHighlightUseCase } from "@/modules/home-highlights/application/use-cases/get-home-highlight.usecase";
import { SequelizeHomeHighlightRepository } from "@/modules/home-highlights/infra/sequelize/sequelize-home-highlight.repository";
import { GetHomeHighlightController } from "../../controllers/get-home-highlight.controller";

export const makeGetHomeHighlightController = (): Controller => {
  const repo = new SequelizeHomeHighlightRepository();
  const usecase = new GetHomeHighlightUseCase(repo);
  return new GetHomeHighlightController(usecase);
};
