import z from "zod";
import {
  createInstitutionalContentSchema,
  updateInstitutionalContentSchema,
} from "../../presentation/http/validators/institutional-content-schema";

export type CreateInstitutionalContentDTO = z.infer<typeof createInstitutionalContentSchema>;
/** PATCH body only; id vem do path. */
export type UpdateInstitutionalContentDTO = z.infer<typeof updateInstitutionalContentSchema>;
