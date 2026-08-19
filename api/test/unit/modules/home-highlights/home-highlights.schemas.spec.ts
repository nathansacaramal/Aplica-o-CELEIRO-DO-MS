import {
  createHomeHighlightSchema,
  updateHomeHighlightSchema,
} from "@/modules/home-highlights/presentation/http/validators/home-highlights.schemas";

const tinyPngB64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const valid = {
  type: "event" as const,
  referenceId: 1,
  title: "Título",
  description: "Descrição ok",
  cityName: "Cidade",
  image: { base64: tinyPngB64, mimeType: "image/png" as const },
  ctaUrl: "https://example.com/c",
  active: true,
  order: 1,
};

describe("home-highlights.schemas", () => {
  it("createHomeHighlightSchema válido", () => {
    expect(createHomeHighlightSchema.safeParse(valid).success).toBe(true);
  });

  it("rejeita tipo inválido e title curto", () => {
    expect(createHomeHighlightSchema.safeParse({ ...valid, type: "x" }).success).toBe(false);
    expect(createHomeHighlightSchema.safeParse({ ...valid, title: "ab" }).success).toBe(false);
  });

  it("updateHomeHighlightSchema parcial", () => {
    expect(updateHomeHighlightSchema.safeParse({ title: "Novo título" }).success).toBe(true);
  });
});
