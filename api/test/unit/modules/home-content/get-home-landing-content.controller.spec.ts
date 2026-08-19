import { HomeHighlightEntity } from "@/modules/home-highlights/domain/entities/home-highlight.entity";
import { GetHomeLandingContentController } from "@/modules/home-content/presentation/http/controllers/get-home-landing-content.controller";

jest.mock("@/core/config/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

describe("GetHomeLandingContentController", () => {
  const highlight = new HomeHighlightEntity({
    id: 1,
    type: "custom",
    referenceId: 0,
    title: "H",
    description: "D",
    cityName: "CG",
    imageUrl: "https://h.png",
    ctaUrl: "https://h",
    active: true,
    order: 0,
  });

  const execute = jest.fn();
  const sut = new GetHomeLandingContentController({ execute } as never);

  it("200 com highlights", async () => {
    execute.mockResolvedValue({ highlights: [highlight] });
    const r = await sut.handle({ correlationId: "c" });
    expect(r.statusCode).toBe(200);
    const body = r.body as {
      data: { highlights: unknown[] };
    };
    expect(body.data.highlights).toHaveLength(1);
  });

  it("mapeia erro do use case", async () => {
    execute.mockRejectedValue(new Error("db"));
    const r = await sut.handle({ correlationId: "c" });
    expect(r.statusCode).not.toBe(200);
  });
});
