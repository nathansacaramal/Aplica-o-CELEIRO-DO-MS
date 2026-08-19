import { AppError } from "@/core/errors-app-error";
import { FindCityByIdUseCase } from "@/modules/cities/application/use-cases/find-city-by-id.usecase";
import { CityEntity } from "@/modules/cities/domain/entities/city.entity";
import { FindCityByIdRepository } from "@/modules/cities/domain/repositories/find-city-by-id.repository";

describe("FindCityByIdUseCase", () => {
  const city = new CityEntity({
    id: 1,
    name: "CG",
    state: "MS",
    slug: "campo-grande",
    summary: "S",
    description: "D",
    imageUrl: "https://x.com/c.jpg",
    published: true,
  });

  it("retorna cidade quando repositório encontra", async () => {
    const findById = jest.fn().mockResolvedValue(city);
    const repo = { findById } as unknown as FindCityByIdRepository;
    const sut = new FindCityByIdUseCase(repo);

    await expect(sut.execute(1)).resolves.toBe(city);
    expect(findById).toHaveBeenCalledWith(1);
  });

  it("lança CIDADE_NOT_FOUND quando repositório retorna null", async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const repo = { findById } as unknown as FindCityByIdRepository;
    const sut = new FindCityByIdUseCase(repo);

    await expect(sut.execute(999)).rejects.toMatchObject({
      code: "CIDADE_NOT_FOUND",
      statusCode: 404,
    });
  });
});
