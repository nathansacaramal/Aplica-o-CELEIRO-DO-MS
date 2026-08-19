import { Controller } from "@/core/protocols";
import {
  CreateCityUseCase,
  DeleteCityUseCase,
  ListCityUseCase,
  UpdateCityUseCase,
  FindCityByIdUseCase,
  FindCityBySlugUsecase,
  PublicListCityUsecase,
} from "@/modules/cities/application/use-cases";
import { SequelizeCityRepository } from "@/modules/cities/infra/sequelize/sequelize-city.repository";
import {
  CreateCityController,
  DeleteCityController,
  ListCityController,
  UpdateCityController,
} from "../controller";
import { FindCityByIdController } from "../controller/find-city-by-id.controller";
import { FindCityBySlugController } from "../controller/find-city-by-slug.controller";
import { PublicListCityController } from "../controller/public-list-city.controller";
import type { FindCityByIdAudience } from "../controller/find-city-by-id.controller";
import { getPublicWebImageUploader } from "@/modules/media/infra/factories/compose-public-web-image-uploader";

const cityRepo = new SequelizeCityRepository();
const images = getPublicWebImageUploader();

const createCityUseCase = new CreateCityUseCase(cityRepo, cityRepo, images);
const listCityUseCase = new ListCityUseCase(cityRepo);
const updateCityUseCase = new UpdateCityUseCase(cityRepo, cityRepo, images);
const deleteCityUseCase = new DeleteCityUseCase(cityRepo);
const findCityByIdUseCase = new FindCityByIdUseCase(cityRepo);
const findCityBySlugUsecase = new FindCityBySlugUsecase(cityRepo);
const publicListCityUsecase = new PublicListCityUsecase(cityRepo);

export function makeListCityController(): Controller {
  return new ListCityController(listCityUseCase);
}

export function makeFindCityByIdController(audience: FindCityByIdAudience): Controller {
  return new FindCityByIdController(findCityByIdUseCase, audience);
}

export function makeCreateCityController(): Controller {
  return new CreateCityController(createCityUseCase);
}

export function makeUpdateCityController(): Controller {
  return new UpdateCityController(updateCityUseCase);
}

export function makeDeleteCityController(): Controller {
  return new DeleteCityController(deleteCityUseCase);
}

export function makePublicListCityController(): Controller {
  return new PublicListCityController(publicListCityUsecase);
}

export function makeFindCityBySlugController(): Controller {
  return new FindCityBySlugController(findCityBySlugUsecase);
}
