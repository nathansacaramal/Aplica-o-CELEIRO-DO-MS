import { Controller } from "@/core/protocols";
import { SequelizeHomeHighlightRepository } from "@/modules/home-highlights/infra/sequelize/sequelize-home-highlight.repository";
import { CreateHomeHighlightUseCase } from "@/modules/home-highlights/application/use-cases/create-home-highlight.usecase";
import { getPublicWebImageUploader } from "@/modules/media/infra/factories/compose-public-web-image-uploader";
import { CreateHomeHighlightController } from "../../controllers/create-home-highlight.controller";

export const makeCreateHomeHighlightController = (): Controller => {
  const repo = new SequelizeHomeHighlightRepository();
  const images = getPublicWebImageUploader();
  const usecase = new CreateHomeHighlightUseCase(repo, images);
  return new CreateHomeHighlightController(usecase);
};
