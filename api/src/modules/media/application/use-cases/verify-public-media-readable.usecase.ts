import { AppError } from "@/core/errors-app-error";
import type { MediaStorageService } from "../../domain/services/media-storage.service";

export interface VerifyPublicMediaReadableResult {
  url: string;
  contentType: string;
  contentLength: number;
}

/**
 * Fase 1 / diagnóstico: confirma que a API (credenciais IAM) consegue ler o objeto
 * referenciado por uma URL pública já “owned” pelo storage configurado.
 */
export class VerifyPublicMediaReadableUseCase {
  constructor(private readonly storage: MediaStorageService) {}

  async execute(url: string): Promise<VerifyPublicMediaReadableResult> {
    const meta = await this.storage.headOwnedPublicUrl(url);
    if (!meta) {
      throw new AppError({
        code: "MEDIA_NOT_READABLE",
        message: "URL inválida, não pertence ao storage configurado ou objeto inexistente",
        statusCode: 404,
      });
    }

    return {
      url,
      contentType: meta.contentType,
      contentLength: meta.contentLength,
    };
  }
}
