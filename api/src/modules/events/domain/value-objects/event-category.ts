// src/modules/events/domain/value-objects/event-category.ts
export const EVENT_CATEGORIES = ["show", "esporte", "feira", "teatro", "gastronomia"] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export function isEventCategory(value: unknown): value is EventCategory {
  return typeof value === "string" && (EVENT_CATEGORIES as readonly string[]).includes(value);
}
