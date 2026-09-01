import { AppError } from "@/core/errors-app-error";
import { GetTouristPointByIdController } from "@/modules/tourist-points/presentation/http/controllers/get-tourist-point-by-id.controller";
import { FindTouristPointBySlugController } from "@/modules/tourist-points/presentation/http/controllers/find-tourist-point-by-slug.controller";
import { GetTouristPointByIdUseCase } from "@/modules/tourist-points/application/use-cases/get-tourist-point-by-id.usecase";
import { TouristPointEntity } from "@/modules/tourist-points/domain/entities/tourist-point.entity";

jest.mock("@/core/config/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

describe("GetTouristPointByIdController", () => {
  const entity = new TouristPointEntity({
    id: 5,
    cityId: 1,
    citySlug: "cg",
    slug: "museu",
    name: "Museu",
    description: "D",
    category: "museu",
    address: "A",
    openingHours: "9-17",
    imageUrl: "https://x.com/i.jpg",
    featured: false,
    published: true,
  });

  const makeSut = (audience: "admin" | "public" = "admin") => {
    const useCase: Pick<GetTouristPointByIdUseCase, "execute"> = {
      execute: jest.fn(),
    };
    const sut = new GetTouristPointByIdController(useCase as GetTouristPointByIdUseCase, audience);
    return { sut, useCase };
  };

  it("retorna 200 com recurso quando encontrado (admin)", async () => {
    const { sut, useCase } = makeSut("admin");
    (useCase.execute as jest.Mock).mockResolvedValue(entity);

    const res = await sut.handle({
      params: { id: "5" },
      correlationId: "cid-1",
    });

    expect(useCase.execute).toHaveBeenCalledWith(5);
    expect(res.statusCode).toBe(200);
    const body = res.body as { data: { id: number }; links: object };
    expect(body.data.id).toBe(5);
    expect(body.links).toBeDefined();
  });

  it("usa links públicos quando audience é public", async () => {
    const { sut, useCase } = makeSut("public");
    (useCase.execute as jest.Mock).mockResolvedValue(entity);

    const res = await sut.handle({
      params: { id: "5" },
      correlationId: "cid-2",
    });

    expect(res.statusCode).toBe(200);
    const body = res.body as { links: Record<string, { href: string }> };
    expect(body.links.self?.href).toContain("/public/");
  });

  it("retorna 404 quando use case lança AppError", async () => {
    const { sut, useCase } = makeSut();
    (useCase.execute as jest.Mock).mockRejectedValue(
      new AppError({
        code: "TOURIST_POINT_NOT_FOUND",
        message: "Ponto turístico não encontrado",
        statusCode: 404,
      }),
    );

    const res = await sut.handle({
      params: { id: "99" },
      correlationId: "cid-3",
    });

    expect(res.statusCode).toBe(404);
  });

  it("retorna 400 quando id inválido", async () => {
    const { sut, useCase } = makeSut();
    const res = await sut.handle({
      params: { id: "bad" },
      correlationId: "cid-4",
    });
    expect(res.statusCode).toBe(400);
    expect(useCase.execute).not.toHaveBeenCalled();
  });
});

describe("FindTouristPointBySlugController", () => {
  const entity = new TouristPointEntity({
    id: 5,
    cityId: 1,
    citySlug: "cg",
    slug: "museu",
    name: "Museu",
    description: "D",
    category: "museu",
    address: "A",
    openingHours: "9-17",
    imageUrl: "https://x.com/i.jpg",
    featured: false,
    published: true,
  });
  const execute = jest.fn();
  const sut = new FindTouristPointBySlugController({ execute } as never);

  it("200 quando encontrado", async () => {
    execute.mockResolvedValue(entity);
    const res = await sut.handle({ correlationId: "c", params: { slug: "museu" } });
    expect(res.statusCode).toBe(200);
  });

  it("404 quando não encontrado", async () => {
    execute.mockResolvedValue(null);
    const res = await sut.handle({ correlationId: "c", params: { slug: "inexistente" } });
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({ error: { code: "PONTO_TURISTICO_NOT_FOUND" } });
  });
});
