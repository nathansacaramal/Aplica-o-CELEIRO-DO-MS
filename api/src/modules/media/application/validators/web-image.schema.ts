import { z } from "zod";
import type { WebImagePayload } from "../../domain/value-objects/web-image-payload";

/** Payload de imagem em base64 (data URL ou só o payload) enviado pelos módulos ao criar/atualizar entidades. */
export const webImageFileSchema = z.object({
  base64: z.string().min(20, "A imagem enviada é inválida. Tente escolher o arquivo novamente."),
  mimeType: z
    .string()
    .regex(
      /^image\/(jpeg|jpg|png|webp|gif)$/i,
      "O arquivo precisa ser uma imagem (JPEG, PNG, WEBP ou GIF)",
    ),
  filename: z.string().min(1).optional(),
}) satisfies z.ZodType<WebImagePayload>;

export type WebImageFileInput = WebImagePayload;
