import { AppError } from "@/core/errors-app-error";
import { GetTouristPointByIdUseCase } from "@/modules/tourist-points/application/use-cases/get-tourist-point-by-id.usecase";
import { TouristPointEntity } from "@/modules/tourist-points/domain/entities/tourist-point.entity";
import { FindTouristPointByIdRepository } from "@/modules/tourist-points/domain/repositories/find-tourist-point-by-id.repository";

describe("GetTouristPointByIdUseCase", () => {
  const entity = new TouristPointEntity({
    id: 3,
    cityId: 1,
    citySlug: "cg",
    name: "M",
    description: "D",
    category: "museu",
    address: "A",
    openingHours: "09:00",
    imageUrl: "https://x.com/i.jpg",
    featured: false,
    published: true,
  });

  const makeSut = () => {
    const findById = jest.fn();
    const repo = { findById } as unknown as FindTouristPointByIdRepository;
    return { sut: new GetTouristPointByIdUseCase(repo), findById };
  };

  it("retorna entidade quando encontrada com id", async () => {
    const { sut, findById } = makeSut();
    findById.mockResolvedValue(entity);
    await expect(sut.execute(3)).resolves.toBe(entity);
    expect(findById).toHaveBeenCalledWith(3);
  });

  it("lança AppError 404 quando não encontrado", async () => {
    const { sut, findById } = makeSut();
    findById.mockResolvedValue(null);
    await expect(sut.execute(1)).rejects.toMatchObject({
      code: "TOURIST_POINT_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("lança AppError quando entidade sem id", async () => {
    const { sut, findById } = makeSut();
    const noId = new TouristPointEntity({
      cityId: 1,
      citySlug: "cg",
      name: "X",
      description: "D",
      category: "museu",
      address: "A",
      openingHours: "09:00",
      imageUrl: "https://x.com/i.jpg",
      featured: false,
      published: true,
    });
    findById.mockResolvedValue(noId);
    await expect(sut.execute(1)).rejects.toBeInstanceOf(AppError);
  });
});
