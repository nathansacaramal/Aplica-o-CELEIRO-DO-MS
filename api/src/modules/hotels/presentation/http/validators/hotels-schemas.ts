import { z } from "zod";

export const searchHotelsQuerySchema = z
  .object({
    city: z.string().trim().min(1, "Selecione uma cidade"),
    state: z.string().trim().min(1, "Selecione uma cidade"),
  })
  .strict();

export type SearchHotelsQueryDTO = z.infer<typeof searchHotelsQuerySchema>;
