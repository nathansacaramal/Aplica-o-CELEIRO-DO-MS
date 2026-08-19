import { CreateTouristPointUseCase } from "@/modules/tourist-points/application/use-cases/create-tourist-point.usecase";
import { DeleteTouristPointUseCase } from "@/modules/tourist-points/application/use-cases/delete-tourist-point.usecase";
import { GetTouristPointByIdUseCase } from "@/modules/tourist-points/application/use-cases/get-tourist-point-by-id.usecase";
import { ListTouristPointsUseCase } from "@/modules/tourist-points/application/use-cases/list-tourist-points.usecase";
import { UpdateTouristPointUseCase } from "@/modules/tourist-points/application/use-cases/update-tourist-point.usecase";
import { SequelizeTouristPointRepository } from "@/modules/tourist-points/infra/sequelize/sequelize-tourist-point.repository";
import { getPublicWebImageUploader } from "@/modules/media/infra/factories/compose-public-web-image-uploader";

export function makeCreateTouristPointUseCase() {
  const repo = new SequelizeTouristPointRepository();
  const images = getPublicWebImageUploader();
  return new CreateTouristPointUseCase(repo, images);
}

export function makeListTouristPointsUseCase() {
  const repo = new SequelizeTouristPointRepository();
  return new ListTouristPointsUseCase(repo);
}

export function makeGetTouristPointByIdUseCase() {
  const repo = new SequelizeTouristPointRepository();
  return new GetTouristPointByIdUseCase(repo);
}

export function makeUpdateTouristPointUseCase() {
  const repo = new SequelizeTouristPointRepository();
  const images = getPublicWebImageUploader();
  return new UpdateTouristPointUseCase(repo, repo, images);
}

export function makeDeleteTouristPointUseCase() {
  const repo = new SequelizeTouristPointRepository();
  return new DeleteTouristPointUseCase(repo);
}
