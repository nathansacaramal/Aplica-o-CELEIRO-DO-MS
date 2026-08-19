// src/modules/media/presentation/http/validators/media-schemas.ts
import { z } from "zod";

export const verifyMediaQuerySchema = z.object({
  url: z.string().url("Informe um link válido (http:// ou https://)"),
});

export type VerifyMediaQueryDTO = z.infer<typeof verifyMediaQuerySchema>;

export const uploadMediaSchema = z.object({
  file: z.object({
    base64: z.string().min(10, "Arquivo inválido. Tente enviar novamente."),
    filename: z.string().min(1, "Nome do arquivo é obrigatório"),
    mimeType: z.string().min(3, "Tipo do arquivo é obrigatório"),
  }),
  folder: z.string().optional(),
  visibility: z.enum(["private", "public"]).optional(),
});
