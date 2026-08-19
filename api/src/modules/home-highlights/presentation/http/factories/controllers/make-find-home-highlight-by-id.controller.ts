import { Controller } from "@/core/protocols";
import { FindHomeHighlightByIdUseCase } from "@/modules/home-highlights/application/use-cases/find-home-highlight-by-id.usecase";
import { SequelizeHomeHighlightRepository } from "@/modules/home-highlights/infra/sequelize/sequelize-home-highlight.repository";
import { FindHomeHighlightByIdController } from "../../controllers/find-home-highlight-by-id.controller";

export const makeFindHomeHighlightByIdController = (): Controller => {
  const repo = new SequelizeHomeHighlightRepository();
  const usecase = new FindHomeHighlightByIdUseCase(repo);
  return new FindHomeHighlightByIdController(usecase);
};
