import {
  HOME_HIGHLIGHT_CATEGORIES,
  isHomeHighlightCategory,
} from "@/modules/home-highlights/domain/value-objects/home-highlight-categories";

describe("home-highlight-categories", () => {
  it("isHomeHighlightCategory", () => {
    expect(isHomeHighlightCategory("event")).toBe(true);
    expect(isHomeHighlightCategory("x")).toBe(false);
    expect(HOME_HIGHLIGHT_CATEGORIES.length).toBeGreaterThan(0);
  });
});
