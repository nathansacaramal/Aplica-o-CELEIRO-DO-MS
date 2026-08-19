import { HomeHighlightEntity } from "@/modules/home-highlights/domain/entities/home-highlight.entity";
import { toHomeHighlightHttpPayload } from "@/modules/home-highlights/presentation/http/mappers/home-highlight-response.mapper";

describe("toHomeHighlightHttpPayload", () => {
  it("serializa entidade para objeto enumerável (JSON)", () => {
    const createdAt = new Date("2024-03-01T00:00:00.000Z");
    const entity = new HomeHighlightEntity({
      id: 1,
      type: "custom",
      referenceId: 0,
      title: "H",
      description: "D",
      cityName: "CG",
      imageUrl: "https://x.png",
      ctaUrl: "https://y",
      active: true,
      order: 0,
      createdAt,
      updatedAt: null,
    });
    const payload = toHomeHighlightHttpPayload(entity);
    expect(JSON.stringify(payload)).toContain("H");
    expect(payload).toEqual({
      id: 1,
      type: "custom",
      referenceId: 0,
      title: "H",
      description: "D",
      cityName: "CG",
      imageUrl: "https://x.png",
      ctaUrl: "https://y",
      active: true,
      order: 0,
      createdAt,
      updatedAt: null,
    });
  });

  it("preserva objeto já plano (ex.: mocks de teste)", () => {
    const plain = {
      id: 2,
      type: "custom" as const,
      referenceId: 0,
      title: "X",
      description: "",
      cityName: "",
      imageUrl: "",
      ctaUrl: "",
      active: true,
      order: 0,
    };
    expect(toHomeHighlightHttpPayload(plain)).toEqual(plain);
  });
});
