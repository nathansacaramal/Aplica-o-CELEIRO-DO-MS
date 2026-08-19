import { FindTouristPointByCityIdUseCase } from "@/modules/tourist-points/application/use-cases/find-tourist-point-by-city-id.usecase";
import { TouristPointEntity } from "@/modules/tourist-points/domain/entities/tourist-point.entity";
import { SequelizeTouristPointRepository } from "@/modules/tourist-points/infra/sequelize/sequelize-tourist-point.repository";

describe("FindTouristPointByCityIdUseCase", () => {
  const entity = new TouristPointEntity({
    id: 1,
    cityId: 9,
    citySlug: "cg",
    name: "Museu",
    description: "D",
    category: "museu",
    address: "A",
    openingHours: "09:00",
    imageUrl: "https://x.com/i.jpg",
    featured: false,
    published: true,
  });

  it("delega ao repositório findByCityId", async () => {
    const findByCityId = jest.fn().mockResolvedValue([entity]);
    const repo = { findByCityId } as unknown as SequelizeTouristPointRepository;
    const sut = new FindTouristPointByCityIdUseCase(repo);

    const out = await sut.execute(9);

    expect(findByCityId).toHaveBeenCalledWith(9);
    expect(out).toEqual([entity]);
  });

  it("repassa null quando repositório retorna null", async () => {
    const findByCityId = jest.fn().mockResolvedValue(null);
    const repo = { findByCityId } as unknown as SequelizeTouristPointRepository;
    const sut = new FindTouristPointByCityIdUseCase(repo);

    expect(await sut.execute(99)).toBeNull();
  });
});
