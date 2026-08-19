import { TOURIST_POINT_SORT_FIELDS } from "@/modules/tourist-points/application/sorting/tourist-point.sort";
import { TOURIST_POINT_CATEGORIES } from "@/modules/tourist-points/domain/value-objects/tourist-point-category";
import { webImageFileSchema } from "@/modules/media/application/validators/web-image.schema";
import { z } from "zod";

export const createTouristPointSchema = z.object({
  id: z.number().optional(),
  cityId: z.number({
    error: (issue) => {
      if (issue.code === "invalid_type" && issue.expected === "number") {
        return { message: "Selecione uma cidade válida" };
      }
      if (issue.code === "invalid_type" && issue.expected === "undefined") {
        return { message: "Selecione uma cidade" };
      }
      return { message: "A cidade selecionada é inválida" };
    },
  }),
  citySlug: z.string(),
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
  description: z.string(),
  category: z.enum(TOURIST_POINT_CATEGORIES, {
    error: (issue) => `Categoria ${String(issue.input)} é inválida`,
  }),
  address: z.string(),
  openingHours: z
    .string({
      error: (issue) => {
        if (issue.input)
          if (issue.code === "invalid_type" && issue.expected === "string") {
            return { message: "Horário deve ser um texto" };
          }
        if (issue.code === "invalid_type" && issue.expected === "undefined") {
          return { message: "Horário é obrigatório" };
        }
        return { message: "Horário é inválido" };
      },
    })
    .regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Horário deve estar no formato HH:mm")
    .min(3, "Horário deve ter pelo menos 3 caracteres"),

  image: webImageFileSchema,

  featured: z.boolean(),

  published: z.boolean(),
});

export const updateTouristPointSchema = z.object({
  cityId: z
    .number({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "number") {
          return { message: "Selecione uma cidade válida" };
        }
        if (issue.code === "invalid_type" && issue.expected === "undefined") {
          return { message: "Selecione uma cidade" };
        }
        return { message: "A cidade selecionada é inválida" };
      },
    })
    .optional(),
  citySlug: z.string().optional(),
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
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .optional(),
  description: z.string().optional(),
  category: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type" && issue.expected === "string") {
          return { message: "Tipo deve ser um texto" };
        }
        if (issue.code === "invalid_type" && issue.expected === "undefined") {
          return { message: "Tipo é obrigatório" };
        }
        return { message: "Tipo é inválido" };
      },
    })
    .min(3, "Tipo deve ter pelo menos 3 caracteres")
    .optional(),
  address: z.string().optional(),
  openingHours: z
    .string({
      error: (issue) => {
        if (issue.input)
          if (issue.code === "invalid_type" && issue.expected === "string") {
            return { message: "Horário deve ser um texto" };
          }
        if (issue.code === "invalid_type" && issue.expected === "undefined") {
          return { message: "Horário é obrigatório" };
        }
        return { message: "Horário é inválido" };
      },
    })
    .regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Horário deve estar no formato HH:mm")
    .min(3, "Horário deve ter pelo menos 3 caracteres")
    .optional(),

  image: webImageFileSchema.optional(),

  featured: z.boolean().optional(),

  published: z.boolean().optional(),
});

/** Query string para GET listagens de pontos turísticos (admin e público). */
export const listTouristPointsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    name: z.string().trim().min(1).optional(),
    city: z.string().trim().min(1).optional(),
    state: z.string().trim().min(1).optional(),
    published: z.preprocess(
      (v) => {
        if (v === true || v === "true" || v === 1 || v === "1") return "true";
        if (v === false || v === "false" || v === 0 || v === "0") return "false";
        return v;
      },
      z.enum(["true", "false"]).optional(),
    ),
    sortBy: z.enum(TOURIST_POINT_SORT_FIELDS).optional(),
    sortDir: z.string().trim().optional(),
  })
  .strict();

export type ListTouristPointsQueryDTO = z.infer<typeof listTouristPointsQuerySchema>;
