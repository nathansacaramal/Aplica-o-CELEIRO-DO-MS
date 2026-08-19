import { ListTouristPointsController } from "@/modules/tourist-points/presentation/http/controllers/list-tourist-point.controller";
import { ListTouristPointsUseCase } from "@/modules/tourist-points/application/use-cases/list-tourist-points.usecase";
import { listTouristPointsQuerySchema } from "@/modules/tourist-points/presentation/http/validators/tourist-point-schemas";

describe("ListTouristPointsController", () => {
  const listRow = {
    id: 1,
    cityId: 1,
    citySlug: "cg",
    name: "Parque",
    description: "D",
    category: "parque",
    address: "A",
    openingHours: "8-18",
    imageUrl: "https://x.com/i.jpg",
    featured: true,
    published: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
  };

  const listResult = {
    items: [listRow],
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
    sort: { sortBy: "name", sortDir: "ASC" as const },
  };

  const makeSut = (audience: "admin" | "public" = "admin") => {
    const useCase: Pick<ListTouristPointsUseCase, "execute"> = {
      execute: jest.fn(),
    };
    const sut = new ListTouristPointsController(useCase as ListTouristPointsUseCase, audience);
    return { sut, useCase };
  };

  it("retorna 200 e coleção (admin)", async () => {
    const { sut, useCase } = makeSut("admin");
    (useCase.execute as jest.Mock).mockResolvedValue(listResult);

    const res = await sut.handle({
      validatedQuery: listTouristPointsQuerySchema.parse({
        page: "1",
        limit: "10",
      }),
      correlationId: "lc-1",
    });

    expect(res.statusCode).toBe(200);
    const body = res.body as { data: unknown[]; meta: { total: number } };
    expect(body.data).toHaveLength(1);
    expect(body.meta.total).toBe(1);
  });

  it("interpreta published na query e chama use case", async () => {
    const { sut, useCase } = makeSut("admin");
    (useCase.execute as jest.Mock).mockResolvedValue(listResult);

    await sut.handle({
      validatedQuery: listTouristPointsQuerySchema.parse({
        published: "true",
      }),
      correlationId: "lc-2",
    });

    expect(useCase.execute).toHaveBeenCalledWith(expect.objectContaining({ published: true }));
  });

  it("lista pública inclui base path público nos links", async () => {
    const { sut, useCase } = makeSut("public");
    (useCase.execute as jest.Mock).mockResolvedValue(listResult);

    const res = await sut.handle({
      validatedQuery: listTouristPointsQuerySchema.parse({}),
      correlationId: "lc-3",
    });

    expect(res.statusCode).toBe(200);
    const body = res.body as { links: Record<string, { href: string }> };
    const hrefs = Object.values(body.links).map((l) => l.href);
    expect(hrefs.some((h) => h.includes("/public/tourist-points"))).toBe(true);
  });
});
