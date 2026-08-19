import { Controller } from "@/core/protocols";
import { VerifyPublicMediaReadableUseCase } from "@/modules/media/application/use-cases/verify-public-media-readable.usecase";
import { buildMediaStorageFromEnv } from "@/modules/media/infra/factories/compose-public-web-image-uploader";
import { VerifyMediaController } from "../controllers/verify-media.controller";

export function makeVerifyMediaController(): Controller {
  const storage = buildMediaStorageFromEnv();
  const useCase = new VerifyPublicMediaReadableUseCase(storage);
  return new VerifyMediaController(useCase);
}
