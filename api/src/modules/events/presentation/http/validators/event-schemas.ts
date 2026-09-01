import { z } from "zod";
import { EVENT_CATEGORIES } from "@/modules/events/domain/value-objects/event-category";
import { webImageFileSchema } from "@/modules/media/application/validators/web-image.schema";

export const createEventSchema = z.object({
  cityId: z.coerce.number().int().positive("Selecione uma cidade"),
  citySlug: z.string(),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  name: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string(),
  category: z.enum(EVENT_CATEGORIES, {
    error: (issue) => `Categoria ${String(issue.input)} é inválida`,
  }),
  startDate: z.coerce.date("Data inicial é obrigatória"),
  endDate: z.coerce.date("Data final é obrigatória"),
  formattedDate: z.string().min(10, "Hora é obrigatória"),
  location: z.string().min(3, "Local é obrigatório"),
  image: webImageFileSchema,
  featured: z.boolean().default(true),
  published: z.boolean().default(true),
});

export const updateEventSchema = createEventSchema.partial();

/** Query string para GET listagens de eventos (admin e público). */
export const listEventsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    name: z.string().trim().min(1).optional(),
    category: z.string().trim().optional(),
    cityId: z.coerce.number().int().positive().optional(),
    sortBy: z.string().trim().optional(),
    sortDir: z.enum(["asc", "desc"]).default("asc"),
  })
  .strict();

export type ListEventsQueryDTO = z.infer<typeof listEventsQuerySchema>;
