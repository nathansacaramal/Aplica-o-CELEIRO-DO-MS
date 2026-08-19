import path from "node:path";
import { ENV } from "@/core/config/env";
import { PublicWebImageService } from "@/modules/media/application/services/public-web-image.service";
import type { PublicWebImageUploader } from "@/modules/media/domain/ports/public-web-image.uploader";
import type { MediaStorageService } from "@/modules/media/domain/services/media-storage.service";
import { SharpWebImageProcessor } from "@/modules/media/infra/image/sharp-web-image.processor";
import { LocalMediaStorageService } from "@/modules/media/infra/storage/local-media-storage.service";
import { S3MediaStorageService } from "@/modules/media/infra/storage/s3-media-storage.service";

let cachedStorage: MediaStorageService | undefined;
let cachedUploader: PublicWebImageUploader | undefined;

function resolvePublicMediaBaseUrl(): string {
  if (ENV.PUBLIC_MEDIA_BASE_URL) {
    return ENV.PUBLIC_MEDIA_BASE_URL.replace(/\/+$/, "");
  }
  if (ENV.MEDIA_STORAGE === "s3" && ENV.S3_PUBLIC_BASE_URL) {
    return ENV.S3_PUBLIC_BASE_URL.replace(/\/+$/, "");
  }
  return `http://127.0.0.1:${ENV.PORT}`;
}

function instantiateMediaStorageFromEnv(): MediaStorageService {
  const publicOrigin = resolvePublicMediaBaseUrl();

  if (ENV.MEDIA_STORAGE === "s3" && ENV.S3_BUCKET && ENV.AWS_REGION && ENV.S3_PUBLIC_BASE_URL) {
    return new S3MediaStorageService({
      bucket: ENV.S3_BUCKET,
      region: ENV.AWS_REGION,
      publicBaseUrl: ENV.S3_PUBLIC_BASE_URL,
      publicKeyPrefix: ENV.S3_PUBLIC_PREFIX,
      defaultStorageClass: ENV.S3_STORAGE_CLASS,
    });
  }

  return new LocalMediaStorageService({
    rootDir: path.resolve(process.cwd(), "uploads"),
    publicBasePath: "/uploads",
    publicOrigin,
    publicKeyPrefix: ENV.S3_PUBLIC_PREFIX,
  });
}

/** Storage de mídia (S3 ou disco) — uma instância por processo. */
export function buildMediaStorageFromEnv(): MediaStorageService {
  cachedStorage ??= instantiateMediaStorageFromEnv();
  return cachedStorage;
}

/** Compositor do uploader de imagens públicas — uma instância por processo. */
export function getPublicWebImageUploader(): PublicWebImageUploader {
  cachedUploader ??= new PublicWebImageService(
    new SharpWebImageProcessor({
      maxWidth: ENV.WEB_IMAGE_MAX_WIDTH,
      maxHeight: ENV.WEB_IMAGE_MAX_HEIGHT,
      lossyQuality: ENV.WEB_IMAGE_WEBP_QUALITY,
    }),
    buildMediaStorageFromEnv(),
  );
  return cachedUploader;
}
