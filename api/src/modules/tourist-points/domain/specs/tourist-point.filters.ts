import { Specification } from "@/core/domain/specification/specification";
import { eq, like } from "@/core/domain/specification/builders";
import { TouristPointCategory } from "../value-objects/tourist-point-category";

export type ListPontosParams = {
  search?: string;
  city?: string;
  state?: string;
  category?: TouristPointCategory;
};

const normalize = (v?: string) => (v?.trim() ? v.trim() : undefined);

export const bySearch = (p: ListPontosParams): Specification | null => {
  const v = normalize(p.search);
  return v ? like("name", v) : null;
};

export const byCity = (p: ListPontosParams): Specification | null => {
  const v = normalize(p.city);
  return v ? eq("city", v) : null;
};

export const byState = (p: ListPontosParams): Specification | null => {
  const v = normalize(p.state);
  return v ? eq("state", v) : null;
};

export const byCategoria = (p: ListPontosParams): Specification | null => {
  const v = normalize(p.category);
  return v ? eq("category", v) : null;
};
