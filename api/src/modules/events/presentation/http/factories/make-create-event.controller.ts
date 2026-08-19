import { CreateEventUseCase } from "@/modules/events/application/use-cases/create-event.usecase";
import { CreateEventController } from "../controllers/create-event.controller";

// infra
import { NoopDomainLogger } from "@/core/logger/domain-logger";
import { FindCityByIdUseCase } from "@/modules/cities/application/use-cases/find-city-by-id.usecase";
import { SequelizeCityRepository } from "@/modules/cities/infra/sequelize/sequelize-city.repository";
import { SequelizeEventRepository } from "@/modules/events/infra/repositories/sequelize-event.repository";
import { getPublicWebImageUploader } from "@/modules/media/infra/factories/compose-public-web-image-uploader";

export function makeCreateEventController() {
  const eventRepo = new SequelizeEventRepository();
  const cityRepo = new SequelizeCityRepository();
  const cityUseCase = new FindCityByIdUseCase(cityRepo);
  const images = getPublicWebImageUploader();
  const usecase = new CreateEventUseCase(eventRepo, cityUseCase, images, new NoopDomainLogger());
  return new CreateEventController(usecase);
}
