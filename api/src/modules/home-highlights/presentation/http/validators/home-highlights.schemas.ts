import { ctaUrlSchema } from "@/core/http/validators/cta-url.schema";
import { webImageFileSchema } from "@/modules/media/application/validators/web-image.schema";
import z from "zod";
import { HOME_HIGHLIGHT_CATEGORIES } from "../../../domain/value-objects/home-highlight-categories";

export const createHomeHighlightSchema = z.object({
  type: z.enum(HOME_HIGHLIGHT_CATEGORIES, {
    error: (issue) => `Categoria ${String(issue.input)} é inválida`,
  }),
  referenceId: z.number({
    error: (issue) => {
      if (issue.code === "invalid_type" && issue.expected === "number") {
        return { message: "Selecione um evento ou ponto turístico válido" };
      }
      if (issue.code === "invalid_type" && issue.expected === "undefined") {
        return { message: "Selecione um evento ou ponto turístico" };
      }
      return { message: "O item selecionado é inválido" };
    },
  }),
  title: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "string") {
          return { message: "Título deve ser um texto" };
        }
        if (issue.code === "invalid_type" && issue.expected === "undefined") {
          return { message: "Título é obrigatório" };
        }
        return { message: "Título é inválido" };
      },
    })
    .min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "string") {
          return { message: "Descrição deve ser um texto" };
        }
        if (issue.code === "invalid_type" && issue.expected === "undefined") {
          return { message: "Descrição é obrigatória" };
        }
        return { message: "Descrição é inválida" };
      },
    })
    .min(3, "Descrição deve ter pelo menos 3 caracteres"),
  cityName: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "string") {
          return { message: "Nome da cidade deve ser um texto" };
        }
        if (issue.code === "invalid_type" && issue.expected === "undefined") {
          return { message: "Nome da cidade é obrigatório" };
        }
        return { message: "Nome da cidade é inválido" };
      },
    })
    .min(3, "Nome da cidade deve ter pelo menos 3 caracteres"),
  image: webImageFileSchema,
  ctaUrl: ctaUrlSchema,
  active: z.boolean().default(true),
  order: z.number().positive(),
});

export const updateHomeHighlightSchema = createHomeHighlightSchema.partial();
