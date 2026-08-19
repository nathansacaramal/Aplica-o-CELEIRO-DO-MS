import type { WebImagePayload } from "../value-objects/web-image-payload";

/**
 * Porta: processar imagem para web, persistir em storage público e opcionalmente
 * substituir URL anterior (com remoção do objeto antigo quando pertencer ao mesmo storage).
 */
export interface PublicWebImageUploader {
  uploadPublicWebImage(
    input: WebImagePayload,
    folder: string,
    storageClass?: string,
  ): Promise<{ url: string }>;

  replacePublicWebImage(
    previousPublicUrl: string | null | undefined,
    input: WebImagePayload,
    folder: string,
    storageClass?: string,
  ): Promise<{ url: string }>;
}
