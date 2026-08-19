import { z } from "zod";
import { pt } from "zod/locales";

z.config(pt());

export const createSocialLinkSchema = z.object({
  platform: z.string().min(1, "Selecione a plataforma"),
  label: z.string().min(1, "Nome do link é obrigatório"),
  url: z.url("Informe um link válido"),
  active: z.boolean().default(true),
  order: z.number().int("Ordem deve ser um número inteiro"),
});

export const updateSocialLinkSchema = z.object({
  platform: z.string().min(1, "Selecione a plataforma").optional(),
  label: z.string().min(1, "Nome do link é obrigatório").optional(),
  url: z.url("Informe um link válido").optional(),
  active: z.boolean().optional(),
  order: z.number().int("Ordem deve ser um número inteiro").optional(),
});
