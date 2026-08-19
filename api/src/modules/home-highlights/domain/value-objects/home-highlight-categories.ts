export const HOME_HIGHLIGHT_CATEGORIES = ["event", "tourist-point", "custom"] as const;

export type HomeHighlightCategory = (typeof HOME_HIGHLIGHT_CATEGORIES)[number];

export function isHomeHighlightCategory(value: unknown): value is HomeHighlightCategory {
  return (
    typeof value === "string" && (HOME_HIGHLIGHT_CATEGORIES as readonly string[]).includes(value)
  );
}
