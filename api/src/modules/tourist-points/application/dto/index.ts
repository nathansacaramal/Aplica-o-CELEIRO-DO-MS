import z from "zod";
import type { TouristPointCategory } from "../../domain/value-objects/tourist-point-category";
import { createTouristPointSchema } from "../../presentation/http/validators/tourist-point-schemas";

export type createTouristPointDTO = z.infer<typeof createTouristPointSchema>;
export type updateTouristPointDTO = Partial<createTouristPointDTO>;

/** Resposta HTTP após criar/atualizar (URL persistida, sem base64). */
export type TouristPointPersistedDTO = {
  id: number;
  cityId: number;
  citySlug: string;
  name: string;
  description: string;
  category: TouristPointCategory;
  address: string;
  openingHours: string;
  imageUrl: string;
  featured: boolean;
  published: boolean;
};
