import z from "zod";
import {
  createHomeHighlightSchema,
  updateHomeHighlightSchema,
} from "../../presentation/http/validators/home-highlights.schemas";
export type CreateHomeHighlightDTO = z.infer<typeof createHomeHighlightSchema>;
/** PATCH body only; id vem do path. */
export type UpdateHomeHighlightDTO = z.infer<typeof updateHomeHighlightSchema>;
