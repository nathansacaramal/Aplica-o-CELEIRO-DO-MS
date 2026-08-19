import {
  HomeHighlightEntity,
  type HomeHighlightType,
} from "@/modules/home-highlights/domain/entities/home-highlight.entity";

/** Corpo JSON alinhado ao contrato admin de home highlights. */
export interface HomeHighlightHttpPayload {
  id: number;
  type: HomeHighlightType;
  referenceId: number;
  title: string;
  description: string;
  cityName: string;
  imageUrl: string;
  ctaUrl: string;
  active: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export function toHomeHighlightHttpPayload(
  source: HomeHighlightEntity | HomeHighlightHttpPayload,
): HomeHighlightHttpPayload {
  if (source instanceof HomeHighlightEntity) {
    return {
      id: source.id,
      type: source.type,
      referenceId: source.referenceId,
      title: source.title,
      description: source.description,
      cityName: source.cityName,
      imageUrl: source.imageUrl,
      ctaUrl: source.ctaUrl,
      active: source.active,
      order: source.order,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt,
    };
  }
  return { ...source };
}
