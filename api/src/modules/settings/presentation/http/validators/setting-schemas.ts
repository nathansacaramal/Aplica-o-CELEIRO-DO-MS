import { webImageFileSchema } from "@/modules/media/application/validators/web-image.schema";
import z from "zod";

export const updateSettingSchema = z.object({
  value: z.unknown().refine((v) => v !== undefined, {
    message: "value é obrigatório",
  }),
});

export const updateSiteLogoSchema = z.object({
  image: webImageFileSchema,
});
