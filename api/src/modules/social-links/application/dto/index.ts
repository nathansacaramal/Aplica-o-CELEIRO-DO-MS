import z from "zod";
import {
  createSocialLinkSchema,
  updateSocialLinkSchema,
} from "@/modules/social-links/presentation/http/validators/social-link.schemas";

export type CreateSocialLinkDTO = z.infer<typeof createSocialLinkSchema>;
/** PATCH body only; id vem do path. */
export type UpdateSocialLinkDTO = z.infer<typeof updateSocialLinkSchema>;
