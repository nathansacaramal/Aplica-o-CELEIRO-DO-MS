import { Controller } from "@/core/protocols";
import { DeleteHomeHighlightUseCase } from "@/modules/home-highlights/application/use-cases/delete-home-highlight.usecase";
import { SequelizeHomeHighlightRepository } from "@/modules/home-highlights/infra/sequelize/sequelize-home-highlight.repository";
import { DeleteHomeHighlightController } from "../../controllers/delete-home-highlight.controller";

export const makeDeleteHomeHighlightController = (): Controller => {
  const repo = new SequelizeHomeHighlightRepository();
  const usecase = new DeleteHomeHighlightUseCase(repo);
  return new DeleteHomeHighlightController(usecase);
};
