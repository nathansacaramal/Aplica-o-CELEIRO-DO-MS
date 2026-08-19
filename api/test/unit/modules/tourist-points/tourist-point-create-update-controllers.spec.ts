import { AppError } from "@/core/errors-app-error";
import { CreateTouristPointController } from "@/modules/tourist-points/presentation/http/controllers/create-tourist-point.controller";
import { UpdateTouristPointController } from "@/modules/tourist-points/presentation/http/controllers/update-tourist-point.controller";

jest.mock("@/core/config/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const persisted = {
  id: 7,
  cityId: 1,
  citySlug: "cg",
  name: "Ponto",
  description: "D",
  category: "parque" as const,
  address: "Rua",
  openingHours: "08:00",
  imageUrl: "https://x/i.png",
  featured: false,
  published: true,
};

describe("CreateTouristPointController", () => {
  const execute = jest.fn();
  const sut = new CreateTouristPointController({ execute } as never);

  it("201 quando use case retorna id", async () => {
    execute.mockResolvedValue(persisted);
    const r = await sut.handle({ correlationId: "c", body: {} });
    expect(r.statusCode).toBe(201);
  });

  it("500 quando id ausente na resposta", async () => {
    execute.mockResolvedValue({ ...persisted, id: 0 });
    const r = await sut.handle({ correlationId: "c", body: {} });
    expect(r.statusCode).toBe(500);
  });

  it("propaga erro do use case", async () => {
    execute.mockRejectedValue(new Error("x"));
    const r = await sut.handle({ correlationId: "c", body: {} });
    expect(r.statusCode).not.toBe(201);
  });
});

describe("UpdateTouristPointController", () => {
  const execute = jest.fn();
  const sut = new UpdateTouristPointController({ execute } as never);

  it("200 quando atualização ok", async () => {
    execute.mockResolvedValue(persisted);
    const r = await sut.handle({
      correlationId: "c",
      params: { id: "7" },
      body: { name: "Novo" },
    });
    expect(r.statusCode).toBe(200);
  });

  it("mapeia erro quando resposta sem id", async () => {
    execute.mockResolvedValue({ ...persisted, id: undefined });
    const r = await sut.handle({
      correlationId: "c",
      params: { id: "7" },
      body: {},
    });
    expect(r.statusCode).not.toBe(200);
  });

  it("404 AppError do use case", async () => {
    execute.mockRejectedValue(
      new AppError({
        code: "PONTO_TURISTICO_NOT_FOUND",
        message: "não encontrado",
        statusCode: 404,
      }),
    );
    const r = await sut.handle({
      correlationId: "c",
      params: { id: "7" },
      body: {},
    });
    expect(r.statusCode).toBe(404);
  });

  it("erro genérico mapeado", async () => {
    execute.mockRejectedValue(new Error("db"));
    const r = await sut.handle({
      correlationId: "c",
      params: { id: "7" },
      body: {},
    });
    expect(r.statusCode).not.toBe(200);
  });
});
