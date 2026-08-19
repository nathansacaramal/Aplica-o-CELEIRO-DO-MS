import { ListTouristPointsUseCase } from "@/modules/tourist-points/application/use-cases/list-tourist-points.usecase";
import { ListTouristPointsSpecificationRepository } from "@/modules/tourist-points/domain/repositories/list-tourist-points-specification.repository";
import { TouristPointEntity } from "@/modules/tourist-points/domain/entities/tourist-point.entity";
import { Op } from "sequelize";

describe("ListTouristPointsUseCase", () => {
  const row = new TouristPointEntity({
    id: 1,
    cityId: 1,
    citySlug: "cg",
    name: "Ponto",
    description: "D",
    category: "museu",
    address: "A",
    openingHours: "09:00",
    imageUrl: "https://x.com/i.jpg",
    featured: false,
    published: true,
  });

  const makeSut = () => {
    const listSpec = jest.fn().mockResolvedValue({ rows: [row], count: 25 }) as jest.MockedFunction<
      ListTouristPointsSpecificationRepository["listSpec"]
    >;
    const repo = { listSpec } as ListTouristPointsSpecificationRepository;
    const sut = new ListTouristPointsUseCase(repo);
    return { sut, listSpec };
  };

  it("normaliza paginação, ordenação e chama repositório com spec null sem filtros", async () => {
    const { sut, listSpec } = makeSut();

    const out = await sut.execute({});

    expect(listSpec).toHaveBeenCalledWith({
      spec: null,
      limit: 10,
      offset: 0,
      order: [["name", "ASC"]],
    });
    expect(out.page).toBe(1);
    expect(out.limit).toBe(10);
    expect(out.total).toBe(25);
    expect(out.totalPages).toBe(3);
    expect(out.items).toHaveLength(1);
    expect(out.sort).toEqual({ sortBy: "name", sortDir: "ASC" });
  });

  it("repassa filtros ao builder e produz spec combinada", async () => {
    const { sut, listSpec } = makeSut();

    await sut.execute({
      page: 2,
      limit: 5,
      name: "M",
      city: "CG",
      state: "MS",
      published: true,
      sortBy: "createdAt",
      sortDir: "DESC",
    });

    expect(listSpec).toHaveBeenCalled();
    const arg = listSpec.mock.calls[0]![0]!;
    expect(arg.limit).toBe(5);
    expect(arg.offset).toBe(5);
    expect(arg.order).toEqual([["createdAt", "DESC"]]);
    expect(arg.spec).not.toBeNull();
    const nested = arg.spec!.toWhere() as { [key: symbol]: unknown };
    expect(nested[Op.and]).toBeDefined();
  });

  it("respeita maxLimit 50 na paginação", async () => {
    const { sut, listSpec } = makeSut();

    await sut.execute({ limit: 999 });

    expect(listSpec).toHaveBeenCalledWith(expect.objectContaining({ limit: 50 }));
  });
});
