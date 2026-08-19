// src/modules/media/application/use-cases/upload-media.usecase.ts
import { ENV } from "@/core/config/env";
import { AppError } from "@/core/errors-app-error";
import { DomainLogger, NoopDomainLogger } from "@/core/logger/domain-logger";
import { decodeBase64PayloadToBuffer } from "../helpers/base64";
import { MediaStorageService } from "../../domain/services/media-storage.service";
import type { WebImageProcessor } from "../../domain/services/web-image.processor";
import { UploadMediaDTO } from "../dto/upload-media.dto";

function isRasterImageMime(mime: string): boolean {
  return /^image\/(jpeg|jpg|png|webp|gif)$/i.test(mime.trim());
}

export interface UploadMediaResult {
  filename: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string;
}

export class UploadMediaUseCase {
  constructor(
    private readonly storage: MediaStorageService,
    private readonly imageProcessor: WebImageProcessor | null = null,
    private readonly logger: DomainLogger = new NoopDomainLogger(),
  ) {}

  async execute(dto: UploadMediaDTO): Promise<UploadMediaResult> {
    this.logger.info("UploadMediaUseCase: start", {
      folder: dto.folder,
      visibility: dto.visibility,
      filename: dto.file?.filename,
    });

    if (!dto.file) {
      throw new AppError({
        code: "MEDIA_EMPTY",
        message: "Nenhum arquivo enviado",
        statusCode: 400,
      });
    }

    let buffer: Buffer;
    try {
      buffer = decodeBase64PayloadToBuffer(dto.file.base64);
    } catch (err) {
      if (err instanceof Error && err.message === "File too large") {
        throw new AppError({
          code: "MEDIA_TOO_LARGE",
          message: "Arquivo excede o tamanho máximo permitido",
          statusCode: 413,
        });
      }
      throw new AppError({
        code: "MEDIA_INVALID_BASE64",
        message: "Arquivo vazio ou base64 inválido",
        statusCode: 400,
      });
    }

    if (!buffer.length) {
      throw new AppError({
        code: "MEDIA_INVALID_BASE64",
        message: "Arquivo vazio ou base64 inválido",
        statusCode: 400,
      });
    }

    const outMime = dto.file.mimeType;
    const outName = dto.file.filename;
    if (
      this.imageProcessor &&
      isRasterImageMime(dto.file.mimeType) &&
      dto.visibility === "public"
    ) {
      buffer = Buffer.from(await this.imageProcessor.process(buffer, dto.file.mimeType));
    }

    const saved = await this.storage.save({
      filename: outName,
      mimeType: outMime,
      buffer,
      folder: dto.folder,
      visibility: dto.visibility,
      storageClass: ENV.MEDIA_STORAGE === "s3" ? ENV.S3_STORAGE_CLASS : undefined,
    });

    this.logger.info("UploadMediaUseCase: done", {
      path: saved.path,
      size: saved.size,
    });

    return {
      filename: outName,
      mimeType: saved.mimeType,
      size: saved.size,
      path: saved.path,
      url: saved.url,
    };
  }
}
