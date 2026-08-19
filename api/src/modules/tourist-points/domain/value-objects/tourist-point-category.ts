// src/modules/events/domain/value-objects/event-category.ts
export const TOURIST_POINT_CATEGORIES = ["parque", "praça", "museu", "igreja"] as const;

export type TouristPointCategory = (typeof TOURIST_POINT_CATEGORIES)[number];

export function isTouristPointCategory(value: unknown): value is TouristPointCategory {
  return (
    typeof value === "string" && (TOURIST_POINT_CATEGORIES as readonly string[]).includes(value)
  );
}
