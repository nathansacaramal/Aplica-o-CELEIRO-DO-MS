import z from "zod";
import { webImageFileSchema } from "@/modules/media/application/validators/web-image.schema";

export const createCitySchema = z.object({
  name: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "string") {
          return { message: "Nome deve ser um texto" };
        }
        if (issue.code === "invalid_type" && issue.expected === "undefined") {
          return { message: "Nome é obrigatório" };
        }
        return { message: "Nome é inválido" };
      },
    })
    .min(3, "Nome deve ter pelo menos 3 caracteres"),

  slug: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "string") {
          return { message: "Slug deve ser um texto" };
        }
        if (issue.code === "invalid_type" && issue.expected === "undefined") {
          return { message: "Slug é obrigatório" };
        }
        return { message: "slug é inválido" };
      },
    })
    .min(3, "slug deve ter pelo menos 3 caracteres"),

  state: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "string") {
          return { message: "UF deve ser um texto" };
        }
        if (issue.code === "invalid_type" && issue.expected === "undefined") {
          return { message: "UF é obrigatório" };
        }
        return { message: "UF é inválida" };
      },
    })
    .length(2, "UF deve ter exatamente 2 caracteres"),

  summary: z.string().min(3, "Resumo deve ter no mínimo 3 caracteres"),

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
    .min(10, "Descrição deve ter pelo menos 10 caracteres"),

  image: webImageFileSchema,

  published: z.boolean(),
});

export const updateCitySchema = z.object({
  name: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "string") {
          return { message: "Nome deve ser um texto" };
        }
        return { message: "Nome é inválido" };
      },
    })
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .optional(),

  slug: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "string") {
          return { message: "Slug deve ser um texto" };
        }
        if (issue.code === "invalid_type" && issue.expected === "undefined") {
          return { message: "Slug é obrigatório" };
        }
        return { message: "slug é inválido" };
      },
    })
    .min(3, "slug deve ter pelo menos 3 caracteres")
    .optional(),

  state: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "string") {
          return { message: "UF deve ser um texto" };
        }
        if (issue.code === "invalid_type" && issue.expected === "undefined") {
          return { message: "UF é obrigatório" };
        }
        return { message: "UF é inválida" };
      },
    })
    .length(2, "UF deve ter exatamente 2 caracteres")
    .optional(),

  summary: z.string().min(3, "Resumo deve ter no mínimo 3 caracteres").optional(),

  description: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "string") {
          return { message: "Descrição deve ser um texto" };
        }
        return { message: "Descrição é inválida" };
      },
    })
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .optional(),

  image: webImageFileSchema.optional(),

  published: z.boolean().optional(),
});

export const getCityParamsSchema = z.object({
  id: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "string") {
          return { message: "ID deve ser um texto" };
        }
        if (issue.code === "invalid_type" && issue.expected === "undefined") {
          return { message: "ID é obrigatório" };
        }
        return { message: "ID é inválido" };
      },
    })
    .regex(/^\d+$/, "ID deve ser um número inteiro representado como string"),
});

export const deleteCityParamsSchema = getCityParamsSchema;

export const listCitiesQuerySchema = z.object({
  page: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "string") {
          return { message: "Page deve ser um texto" };
        }
        return { message: "Page é inválida" };
      },
    })
    .regex(/^\d+$/, "Page deve ser um número inteiro representado como string")
    .optional(),

  limit: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "string") {
          return { message: "Limit deve ser um texto" };
        }
        return { message: "Limit é inválido" };
      },
    })
    .regex(/^\d+$/, "Limit deve ser um número inteiro representado como string")
    .optional(),
});
