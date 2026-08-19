import { ENV } from "@/core/config/env";
import { AppError } from "@/core/errors-app-error";
import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import type { PublicWebImageUploader } from "../../domain/ports/public-web-image.uploader";
import type { WebImagePayload } from "../../domain/value-objects/web-image-payload";
import { MediaStorageService } from "../../domain/services/media-storage.service";
import { WebImageProcessor } from "../../domain/services/web-image.processor";
import { decodeBase64PayloadToBuffer } from "../helpers/base64";

function bufferFromImageBase64(base64: string): Buffer {
  try {
    return decodeBase64PayloadToBuffer(base64);
  } catch (err) {
    if (err instanceof Error && err.message === "File too large") {
      throw new AppError({
        code: "MEDIA_TOO_LARGE",
        message: "Imagem excede o tamanho máximo permitido",
        statusCode: 413,
      });
    }
    throw new AppError({
      code: "MEDIA_INVALID_BASE64",
      message: "Imagem vazia ou base64 inválido",
      statusCode: 400,
    });
  }
}

function defaultFilenameForMime(mime: string): string {
  const m = mime.trim().toLowerCase();
  if (m === "image/png") return "upload.png";
  if (m === "image/webp") return "upload.webp";
  if (m === "image/gif") return "upload.gif";
  if (m === "image/jpeg" || m === "image/jpg") return "upload.jpg";
  return "upload.jpg";
}

/**
 * Caso de uso de aplicação: redimensiona imagem (mantém formato), grava em storage público
 * e remove URLs anteriores gerenciadas pelo mesmo storage ao substituir.
 */
export class PublicWebImageService implements PublicWebImageUploader {
  constructor(
    private readonly processor: WebImageProcessor,
    private readonly storage: MediaStorageService,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  private async removeIfOwned(previousPublicUrl: string | null | undefined): Promise<void> {
    if (!previousPublicUrl?.trim()) return;
    await this.storage.deleteIfOwnedPublicUrl(previousPublicUrl.trim());
  }

  async uploadPublicWebImage(
    input: WebImagePayload,
    folder: string,
    storageClass?: string,
  ): Promise<{ url: string }> {
    const buffer = bufferFromImageBase64(input.base64);
    if (!buffer.length) {
      throw new AppError({
        code: "MEDIA_INVALID_BASE64",
        message: "Imagem vazia ou base64 inválido",
        statusCode: 400,
      });
    }

    const processed = await this.processor.process(buffer, input.mimeType);

    const resolvedClass =
      storageClass ?? (ENV.MEDIA_STORAGE === "s3" ? ENV.S3_STORAGE_CLASS : undefined);

    const filename = input.filename?.trim() || defaultFilenameForMime(input.mimeType);

    const saved = await this.storage.save({
      filename,
      mimeType: input.mimeType,
      buffer: processed,
      folder: folder.replace(/^\/+|\/+$/g, ""),
      visibility: "public",
      storageClass: resolvedClass,
    });

    if (!saved.url) {
      throw new AppError({
        code: "MEDIA_PUBLIC_URL_MISSING",
        message:
          "Storage não retornou URL pública. Configure S3_PUBLIC_BASE_URL (S3) ou PUBLIC_MEDIA_BASE_URL + origem local.",
        statusCode: 500,
      });
    }

    this.logger.info("PublicWebImageService: uploaded", {
      folder,
      size: saved.size,
    });

    return { url: saved.url };
  }

  async replacePublicWebImage(
    previousPublicUrl: string | null | undefined,
    input: WebImagePayload,
    folder: string,
    storageClass?: string,
  ): Promise<{ url: string }> {
    await this.removeIfOwned(previousPublicUrl);
    return this.uploadPublicWebImage(input, folder, storageClass);
  }
}
