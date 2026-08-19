import { Controller } from "@/core/protocols";
import { UploadMediaUseCase } from "@/modules/media/application/use-cases/upload-media.usecase";
import { SharpWebImageProcessor } from "@/modules/media/infra/image/sharp-web-image.processor";
import { buildMediaStorageFromEnv } from "@/modules/media/infra/factories/compose-public-web-image-uploader";
import { ENV } from "@/core/config/env";
import { UploadMediaController } from "../controllers/upload-media.controller";

export function makeUploadMediaController(): Controller {
  const storage = buildMediaStorageFromEnv();
  const processor = new SharpWebImageProcessor({
    maxWidth: ENV.WEB_IMAGE_MAX_WIDTH,
    maxHeight: ENV.WEB_IMAGE_MAX_HEIGHT,
    lossyQuality: ENV.WEB_IMAGE_WEBP_QUALITY,
  });
  const useCase = new UploadMediaUseCase(storage, processor);
  return new UploadMediaController(useCase);
}
