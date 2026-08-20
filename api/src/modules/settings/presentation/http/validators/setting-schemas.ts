import z from "zod";

export const updateSettingSchema = z.object({
  value: z.unknown().refine((v) => v !== undefined, {
    message: "value é obrigatório",
  }),
});
